package com.yorosis.yoroflow.creation.service;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.mail.MessagingException;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.param.CustomerCreateParams;
import com.yorosis.yoroapps.entities.CustomerPayment;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.OrgSubscription;
import com.yorosis.yoroapps.entities.Organization;
import com.yorosis.yoroapps.entities.PaymentCustomerDetails;
import com.yorosis.yoroapps.entities.PaymentSettings;
import com.yorosis.yoroapps.entities.PaymentSubscriptionDetails;
import com.yorosis.yoroapps.vo.CustomerPaymentVO;
import com.yorosis.yoroapps.vo.CustomersVO;
import com.yorosis.yoroapps.vo.OrganizationDiscountVo;
import com.yorosis.yoroapps.vo.OrganizationVO;
import com.yorosis.yoroapps.vo.PlanDetailsListVo;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.provisioning.service.ProvisioningService;
import com.yorosis.yoroflow.creation.repository.CustomerPaymentRepository;
import com.yorosis.yoroflow.creation.repository.CustomersRepository;
import com.yorosis.yoroflow.creation.repository.OrgSubscriptionRepository;
import com.yorosis.yoroflow.creation.repository.OrganizationRepository;
import com.yorosis.yoroflow.creation.repository.PaymentCustomerDetailsRepository;
import com.yorosis.yoroflow.creation.repository.PaymentSettingsRepository;
import com.yorosis.yoroflow.creation.repository.PaymentSubscriptionDetailsRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class CustomerService {
	private static final String DATA_IMAGE_JPEG_BASE64 = "data:image/jpeg;base64,";

	private static final String MONTHLY = "monthly";
	private static final String YEARLY = "yearly";
	private static final String STRIPE_KEY = "Stripe Key";

	private static final String[] RESERVED_DOMAINS = new String[] { "ntp", "time", "app", "apps", "ftp", "sftp", "mail",
			"email", "ssh", "admin", "analytics", "partner", "customer", "employee", "portal", "web", "www", "dns",
			"blog", "mx", "pop", "smtp", "sso", "ssl", "api", "secure", "security", "vpn", "contactus", "payment",
			"pay", "help", "chat", "file", "files", "calendar", "status", "list", "lists", "license", "liveclaims",
			"liverules", "liveapps", "livetester", "flow", "yorodata", "yoroflows", "yoroflow", "yorosis", "yoroapps",
			"yoroclaims", "yorotester", "yororules" };

	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private ProvisioningService provisioningService;

	@Autowired
	private FileManagerService fileManagerService;

	@Autowired
	private ServiceTokenHandlerService serviceTokenHandlerService;

	@Autowired
	private OrganizationRepository organizationRepository;

	@Autowired
	private OrganizationService organizationService;

	@Autowired
	private TimeZoneService timeZoneService;

	@Autowired
	private UserService userService;

	@Autowired
	private CustomerPaymentRepository customerPaymentRepository;

	@Autowired
	private PaymentCustomerDetailsRepository paymentCustomerDetailsRepository;

	@Autowired
	private PaymentSettingsRepository paymentSettingsRepository;

	@Autowired
	private StringEncryptor jasyptEncryptor;

	@Autowired
	private OrganizationDiscountService organizationDiscountService;

	@Autowired
	private PaymentSubscriptionDetailsRepository paymentSubscriptionDetailsRepository;

	@Autowired
	private OrgSubscriptionRepository orgSubscriptionRepository;

	@Value("${api.stripe.key}")
	private String stripeApiKey;

	private CustomersVO constructConsumerDTOToVO(Customers customers) throws IOException {
		List<String> allowedDomainNamesList = null;
		if (customers.getAllowedDomainNames() != null) {
			String allowedDomainNames = customers.getAllowedDomainNames();
			allowedDomainNamesList = Arrays.asList(allowedDomainNames.split(","));
		}

		CustomersVO customersVO = CustomersVO.builder().orgName(customers.getOrgName())
				.actualDomainName(customers.getActualDomainName()).subdomainName(customers.getSubdomainName())
				.id(customers.getId()).defaultLanguge(customers.getDefaultLanguge()).timezone(customers.getTimezone())
				.allowedDomainNames(allowedDomainNamesList).themeId(customers.getThemeId())
				.image(getOrganizationLogoAndBackground(customers, true))
				.organizationUrl(customers.getOrganizationUrl()).startDate(customers.getTrialStartDate())
				.endDate(customers.getTrialEndDate()).serverFarm(customers.getServerFarm())
				.dataSourceName(customers.getDatasourceName()).maximumUsers(customers.getMaximunUsers())
				.customerPaymentId(customers.getPaymentCustomerId())
				.organizationDiscountList(organizationDiscountService.getOrganizationDiscount(customers.getId()))
				.backgroundImage(getOrganizationLogoAndBackground(customers, false))
				.subscriptionStartDate(customers.getSubscriptionStartDate())
				.subscriptionEndDate(customers.getSubscriptionEndDate())
				.isPayingCustomer(customers.getIsPayingCustomer()).build();

		List<OrgSubscription> orgSubscriptionList = orgSubscriptionRepository.getOrgSubscriptionBasedOnCustomerId(
				customers.getId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		if (!orgSubscriptionList.isEmpty() && customers.getSubscriptionStartDate() != null
				&& customers.getSubscriptionEndDate() != null) {
			List<OrgSubscription> list = orgSubscriptionList.stream()
					.filter(t -> StringUtils.equals(t.getActivePlan(), YoroappsConstants.YES))
					.collect(Collectors.toList());
			if (!list.isEmpty()) {
				OrgSubscription orgSubscription = list.get(0);
				if (orgSubscription != null) {
					customersVO.setOrgPlanType(orgSubscription.getPlanType().getPlanName());
					customersVO.setOrgBillingType(orgSubscription.getBillingType());
				}
			}
		}

		return customersVO;

	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO createCustomerFromAccount(CustomersVO customerVo, List<MultipartFile> file, String remoteIp)
			throws IOException, YoroappsException, MessagingException, StripeException {
		String allowedDomains = null;
		if (customerVo.getAllowedDomainNames() != null && !customerVo.getAllowedDomainNames().isEmpty()) {
			allowedDomains = String.join(",", customerVo.getAllowedDomainNames());
		}

		if (customerVo.getId() == null) {
			ResponseStringVO responseStringVo = validateNewAccountDetails(customerVo);
			if (responseStringVo != null) {
				return responseStringVo;
			}

			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			Customers customers = Customers.builder().subdomainName(trim(customerVo.getSubdomainName()))
					.actualDomainName(trim(customerVo.getActualDomainName())).allowedDomainNames(trim(allowedDomains))
					.orgName(customerVo.getOrgName()).registeredFromIp(remoteIp).timezone(customerVo.getTimezone())
					.tenantId("yet_to_generate'").isOnTrial(YoroappsConstants.YES)
					.trialStartDate(customerVo.getStartDate()).trialEndDate(customerVo.getEndDate())
					.isPayingCustomer(YoroappsConstants.NO).defaultLanguge("en")
					.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
					.modifiedBy(YorosisContext.get().getUserName()).themeId(customerVo.getThemeId())
					.modifiedOn(timestamp).activeFlag(YoroappsConstants.YES).maximunUsers(customerVo.getMaximumUsers())
					.organizationUrl(customerVo.getOrganizationUrl()).serverFarm(customerVo.getServerFarm())
					.datasourceName(customerVo.getDataSourceName()).registrationDate(new Date(timestamp.getTime()))
					.subscriptionStartDate(customerVo.getStartDate()).subscriptionEndDate(customerVo.getEndDate())
					.build();

			int count = customersRepository.getTotalCustomersCount();
			customers.setCustomerNumber(count + 1);
			Customers savedCustomer = customersRepository.save(customers);
			savePackageDetails(customerVo, savedCustomer);
			savedCustomer.setTenantId(generateTenantId(savedCustomer));

//			savedCustomer.setPaymentCustomerId(setupPaymentSetup(customerVo));

			if (file != null) {
				saveOrUpdateApplicationLogo(file, savedCustomer);
			}
			customersRepository.save(savedCustomer);
//			if (customerVo.getOrganizationDiscountList() != null) {
//				organizationDiscountService.saveDiscount(customerVo.getOrganizationDiscountList(), savedCustomer);
//			}
			provisioningService.provisionNewCustomer(savedCustomer.getTenantId());

			postCustomerSchemaCreation(customerVo, savedCustomer, file, true);

			return ResponseStringVO.builder().response("Your Organization Created Successfully").build();
		}
		return null;
	}

	@Transactional
	public ResponseStringVO createCustomer(CustomersVO customerVo, List<MultipartFile> file, String remoteIp)
			throws IOException, YoroappsException, MessagingException, StripeException {
		String allowedDomains = null;
		if (customerVo.getAllowedDomainNames() != null && !customerVo.getAllowedDomainNames().isEmpty()) {
			allowedDomains = String.join(",", customerVo.getAllowedDomainNames());
		}

		if (customerVo.getId() == null) {
			ResponseStringVO responseStringVo = validateNewAccountDetails(customerVo);
			if (responseStringVo != null) {
				return responseStringVo;
			}

			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			Customers customers = Customers.builder().subdomainName(trim(customerVo.getSubdomainName()))
					.actualDomainName(trim(customerVo.getActualDomainName())).allowedDomainNames(trim(allowedDomains))
					.orgName(customerVo.getOrgName()).registeredFromIp(remoteIp).timezone(customerVo.getTimezone())
					.tenantId("yet_to_generate'").isOnTrial(YoroappsConstants.YES)
					.trialStartDate(customerVo.getStartDate()).trialEndDate(customerVo.getEndDate())
					.isPayingCustomer(YoroappsConstants.NO).defaultLanguge("en")
					.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
					.modifiedBy(YorosisContext.get().getUserName()).themeId(customerVo.getThemeId())
					.modifiedOn(timestamp).activeFlag(YoroappsConstants.YES).maximunUsers(customerVo.getMaximumUsers())
					.organizationUrl(customerVo.getOrganizationUrl()).serverFarm(customerVo.getServerFarm())
					.datasourceName(customerVo.getDataSourceName()).registrationDate(new Date(timestamp.getTime()))
					.subscriptionStartDate(customerVo.getStartDate()).subscriptionEndDate(customerVo.getEndDate())
					.build();

			int count = customersRepository.getTotalCustomersCount();
			customers.setCustomerNumber(count + 1);
			Customers savedCustomer = customersRepository.save(customers);
			savePackageDetails(customerVo, savedCustomer);
			savedCustomer.setTenantId(generateTenantId(savedCustomer));

//			savedCustomer.setPaymentCustomerId(setupPaymentSetup(customerVo));

			if (file != null) {
				saveOrUpdateApplicationLogo(file, savedCustomer);
			}
			customersRepository.save(savedCustomer);
//			if (customerVo.getOrganizationDiscountList() != null) {
//				organizationDiscountService.saveDiscount(customerVo.getOrganizationDiscountList(), savedCustomer);
//			}
			provisioningService.provisionNewCustomer(savedCustomer.getTenantId());

			postCustomerSchemaCreation(customerVo, savedCustomer, file, false);

			return ResponseStringVO.builder().response("Your Organization Created Successfully").build();
		} else {
			return updateCustomer(customerVo, allowedDomains, file);
		}
	}

	private void postCustomerSchemaCreation(CustomersVO customerVo, Customers savedCustomer, List<MultipartFile> file,
			boolean fromAccount) throws MessagingException, YoroappsException, IOException {
		YorosisContext currentTenant = YorosisContext.get();
		try {
			YorosisContext.clear();
			YorosisContext context = YorosisContext.builder().tenantId(savedCustomer.getTenantId())
					.userName(currentTenant.getUserName()).build();
			YorosisContext.set(context);

			UUID userId = provisioningService.setupFirstUser(customerVo, fromAccount);
			provisioningService.setupOrganization(savedCustomer);
			provisioningService.insertDefaultValues(savedCustomer.getTenantId(), userId, null, savedCustomer);
			provisioningService.addDefaultRole(userId);
			timeZoneService.updateTimeZone(customerVo.getTimezone());
			serviceTokenHandlerService.createServiceToken(userId);

			inviteUser(customerVo, savedCustomer, file);
		} finally {
			YorosisContext.clear();
			YorosisContext.set(currentTenant);
		}
	}

	private void savePackageDetails(CustomersVO customerVo, Customers customers) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		List<PaymentSubscriptionDetails> subscriptionDetailsList = new ArrayList<>();
		PaymentSubscriptionDetails starterDetails = PaymentSubscriptionDetails.builder().yearlyPrice(0.00F)
				.monthlyPrice(0.00F).planName("STARTER").customerId(customers.getId()).basePrice(0.00F)
				.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
				.createdDate(timestamp).activeFlag(YoroappsConstants.YES).build();
		subscriptionDetailsList.add(starterDetails);

		for (OrganizationDiscountVo vo : customerVo.getOrganizationDiscountList()) {
			PaymentSubscriptionDetails paymentDetails = PaymentSubscriptionDetails.builder()
					.basePrice(vo.getBasePrice()).yearlyPrice(vo.getAmountPerUserYearly())
					.monthlyPrice(vo.getAmountPerUserMonthly()).planName(vo.getPlanName()).customerId(customers.getId())
					.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
					.createdDate(timestamp).activeFlag(YoroappsConstants.YES).build();
			subscriptionDetailsList.add(paymentDetails);
		}

		paymentSubscriptionDetailsRepository.saveAll(subscriptionDetailsList);

		PaymentSubscriptionDetails paymentSubscriptionDetails = paymentSubscriptionDetailsRepository
				.getbyNameAndPaymentSubscriptionDetails(customers.getId(), customerVo.getOrgPlanType(),
						YoroappsConstants.YES);
		if (paymentSubscriptionDetails != null && customers.getId() != null) {
			OrgSubscription orgSubscription = OrgSubscription.builder().customerId(customers.getId())
					.planType(paymentSubscriptionDetails).updatedBy(YorosisContext.get().getUserName())
					.updatedDate(timestamp).createdBy(YorosisContext.get().getUserName()).createdDate(timestamp)
					.subscriptionStartDate(customerVo.getStartDate()).subscriptionEndDate(customerVo.getEndDate())
					.tenantId(YorosisContext.get().getTenantId()).activeFlag(YoroappsConstants.YES)
					.activePlan(YoroappsConstants.YES).build();
			if (StringUtils.isNotBlank(customerVo.getOrgBillingType())) {
				orgSubscription.setBillingType(customerVo.getOrgBillingType());
				if (StringUtils.equals(customerVo.getOrgBillingType(), MONTHLY)) {
					orgSubscription.setSubscriptionAmount(paymentSubscriptionDetails.getMonthlyPrice());
				} else if (StringUtils.equals(customerVo.getOrgBillingType(), YEARLY)) {
					orgSubscription.setSubscriptionAmount(paymentSubscriptionDetails.getYearlyPrice());
				}
			} else {
				orgSubscription.setBillingType(MONTHLY);
				orgSubscription.setSubscriptionAmount(paymentSubscriptionDetails.getMonthlyPrice());
			}

			orgSubscriptionRepository.save(orgSubscription);
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public OrganizationDiscountVo getAmountPerUser(CustomersVO customerVo) {
		PaymentSubscriptionDetails paymentSubscriptionDetails = paymentSubscriptionDetailsRepository
				.getbyNameAndPaymentSubscriptionDetails(customerVo.getId(), customerVo.getOrgPlanType(),
						YoroappsConstants.YES);
		return paymentSubscriptionDetails != null
				? OrganizationDiscountVo.builder().amountPerUserMonthly(paymentSubscriptionDetails.getMonthlyPrice())
						.amountPerUserYearly(paymentSubscriptionDetails.getYearlyPrice()).build()
				: OrganizationDiscountVo.builder().build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public List<PlanDetailsListVo> getPaymentDetailsByCustomer(CustomersVO customerVo) {
		List<PlanDetailsListVo> voList = new ArrayList<>();
		List<PaymentSubscriptionDetails> paymentSubscriptionDetailsList = paymentSubscriptionDetailsRepository
				.getPaymentSubscriptionDetails(customerVo.getId(), YorosisContext.get().getTenantId(),
						YoroappsConstants.YES);
		for (PaymentSubscriptionDetails PaymentSubscriptionDetails : paymentSubscriptionDetailsList) {
			PlanDetailsListVo organizationDiscountVo = PlanDetailsListVo.builder()
					.planName(PaymentSubscriptionDetails.getPlanName())
					.basePrice(PaymentSubscriptionDetails.getBasePrice())
					.monthlyPrice(PaymentSubscriptionDetails.getMonthlyPrice())
					.yearlyPrice(PaymentSubscriptionDetails.getYearlyPrice()).build();
			voList.add(organizationDiscountVo);
		}
		return voList;
	}

	private String setupPaymentSetup(CustomersVO customerVo) throws StripeException {
		PaymentSettings paymentSettings = paymentSettingsRepository.findByStripeKeyNameAndTenantIdAndActiveFlag(
				STRIPE_KEY, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (paymentSettings != null) {
			Stripe.apiKey = jasyptEncryptor.decrypt(paymentSettings.getSecretKey());
			CustomerCreateParams customerParams = null;
			if (StringUtils.isNotBlank(customerVo.getOrgName())) {
				customerParams = CustomerCreateParams.builder().setEmail(customerVo.getContactEmailId())
						.setDescription(customerVo.getOrgName()).build();
			} else {
				customerParams = CustomerCreateParams.builder().setEmail(customerVo.getContactEmailId())
						.setDescription(customerVo.getContactEmailId()).build();
			}

			Customer customer = Customer.create(customerParams);
			return customer.getId();
		}

		return null;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public String setupPaymentSetupFromOrganization(String email, String currentTenantId) throws StripeException {
		Customers customers = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(currentTenantId,
				YoroappsConstants.YES);
		PaymentSettings paymentSettings = paymentSettingsRepository.findByStripeKeyNameAndTenantIdAndActiveFlag(
				STRIPE_KEY, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (paymentSettings != null && customers != null) {
			Stripe.apiKey = jasyptEncryptor.decrypt(paymentSettings.getSecretKey());

			CustomerCreateParams customerParams = CustomerCreateParams.builder().setEmail(email)
					.setDescription(customers.getOrgName()).build();

			Customer customer = Customer.create(customerParams);

			customers.setPaymentCustomerId(customer.getId());
			customersRepository.save(customers);

			return customer.getId();
		}

		return null;
	}

	private ResponseStringVO validateNewAccountDetails(CustomersVO customerVo) {
		if (StringUtils.equalsAnyIgnoreCase(trim(customerVo.getSubdomainName()), RESERVED_DOMAINS)) {
			return ResponseStringVO.builder().response(String.format(
					"Selected subdomain name: %s is one of the reserved subdomain.  Please choose a different subdomain name.",
					customerVo.getSubdomainName())).build();
		}

		Customers existingSubdomain = customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(
				trim(customerVo.getSubdomainName()), YoroappsConstants.YES);
		if (existingSubdomain != null) {
			return ResponseStringVO.builder()
					.response(String.format(
							"Customer with subdomain name: %s already exists.  Please try a different subdomain name.",
							customerVo.getSubdomainName()))
					.build();
		}

		return null;
	}

	private ResponseStringVO updateCustomer(CustomersVO customerVo, String allowedDomains, List<MultipartFile> file)
			throws IOException {
		Customers updateCustomer = customersRepository.findByIdAndActiveFlagIgnoreCase(customerVo.getId(),
				YoroappsConstants.YES);

		updateCustomer.setOrgName(customerVo.getOrgName());
		updateCustomer.setDefaultLanguge(customerVo.getDefaultLanguge());
		if (StringUtils.isNotBlank(customerVo.getTimezone())) {
			updateCustomer.setTimezone(customerVo.getTimezone());
		}
		updateCustomer.setAllowedDomainNames(trim(allowedDomains));
		updateCustomer.setActualDomainName(trim(customerVo.getActualDomainName()));
		updateCustomer.setSubdomainName(trim(customerVo.getSubdomainName()));
		updateCustomer.setOrganizationUrl(customerVo.getOrganizationUrl());
		updateCustomer.setServerFarm(customerVo.getServerFarm());
		updateCustomer.setDatasourceName(customerVo.getDataSourceName());
		updateCustomer.setTrialStartDate(customerVo.getStartDate());
		updateCustomer.setTrialEndDate(customerVo.getEndDate());
		updateCustomer.setMaximunUsers(customerVo.getMaximumUsers());
		if (file != null) {
			saveOrUpdateApplicationLogo(file, updateCustomer);
		}

		if (customerVo.getOrganizationDiscountList() != null) {
			organizationDiscountService.saveDiscount(customerVo.getOrganizationDiscountList(), updateCustomer);
		}

		updateCustomer.setThemeId(customerVo.getThemeId());
		customersRepository.save(updateCustomer);
		YorosisContext currentTenant = YorosisContext.get();
		try {
			YorosisContext.clear();
			YorosisContext context = YorosisContext.builder().tenantId(updateCustomer.getTenantId())
					.userName(currentTenant.getUserName()).build();
			YorosisContext.set(context);
		} finally {
			YorosisContext.clear();
			YorosisContext.set(currentTenant);
		}

		return ResponseStringVO.builder().response("Your Organization Updated Successfully").build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public Customers getCustomerInfoForOtherDomain(String domain) throws IOException {
		Customers customers = customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(domain,
				YoroappsConstants.YES);
		if (customers != null) {
			return customers;
		} else {
			return null;
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public Customers getCustomerInfoByTenantId(String tenantId) throws IOException {
		Customers customers = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(tenantId,
				YoroappsConstants.YES);
		if (customers != null) {
			return customers;
		} else {
			return null;
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO savePaymentDetails(CustomerPayment payment, PaymentCustomerDetails paymentCustomerDetails,
			String tenantId, Date startDate, Date endDate, Boolean isUpgrade) {
		customerPaymentRepository.save(payment);
		if (paymentCustomerDetails != null) {
			paymentCustomerDetailsRepository.save(paymentCustomerDetails);
		}
		Customers customers = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(tenantId,
				YoroappsConstants.YES);
		if (customers != null && BooleanUtils.isTrue(isUpgrade)) {
			customers.setIsPayingCustomer(YoroappsConstants.YES);
			customers.setSubscriptionStartDate(startDate);
			customers.setSubscriptionEndDate(endDate);
		}
		return ResponseStringVO.builder().response("Payment Processed").build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public CustomerPaymentVO getPaymentDetails(String paymentCustomerId, String tenantId, boolean isAdditionalUser) {
		List<CustomerPayment> paymentList = customerPaymentRepository
				.findByPaymentCustomerIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(paymentCustomerId, tenantId,
						YoroappsConstants.YES);

		if (!paymentList.isEmpty()) {

			CustomerPayment payment = paymentList.stream().filter(t -> t.getCreatedOn() != null)
					.sorted(Comparator.comparing(CustomerPayment::getCreatedOn).reversed()).collect(Collectors.toList())
					.get(0);

			if (payment != null) {
				if (BooleanUtils.isFalse(isAdditionalUser)) {
					payment.setActiveFlag(YoroappsConstants.NO);
					customerPaymentRepository.save(payment);
				}
				return CustomerPaymentVO.builder().paymentSubscriptionId(payment.getPaymentSubscriptionId())
						.quantity(payment.getQuantity()).paymentPriceId(payment.getPaymentPriceId()).build();
			}
		}

		return CustomerPaymentVO.builder().build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public CustomerPayment getPaymentDetailsForWebhook(String paymentCustomerId, String tenantId) {
		List<CustomerPayment> paymentList = customerPaymentRepository
				.findByPaymentCustomerIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(paymentCustomerId, tenantId,
						YoroappsConstants.YES);

		if (!paymentList.isEmpty()) {
			CustomerPayment payment = paymentList.stream().filter(t -> t.getCreatedOn() != null)
					.sorted(Comparator.comparing(CustomerPayment::getCreatedOn).reversed()).collect(Collectors.toList())
					.get(0);

			if (payment != null) {
				return payment;
			}
		}
		return CustomerPayment.builder().build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public CustomerPayment getPaymentDetailsForSubscription(String paymentCustomerId, String tenantId) {
		List<CustomerPayment> paymentList = customerPaymentRepository
				.findByPaymentCustomerIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(paymentCustomerId, tenantId,
						YoroappsConstants.YES);

		if (!paymentList.isEmpty()) {
			CustomerPayment payment = paymentList.stream().filter(t -> t.getCreatedOn() != null)
					.sorted(Comparator.comparing(CustomerPayment::getCreatedOn)).collect(Collectors.toList()).get(0);

			if (payment != null) {
				return payment;
			}
		}
		return CustomerPayment.builder().build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public PaymentSettings getPaymentSettings() {
		return paymentSettingsRepository.findByStripeKeyNameAndTenantIdAndActiveFlag(STRIPE_KEY,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
	}

	private void inviteUser(CustomersVO customerVO, Customers customers, List<MultipartFile> files)
			throws MessagingException, YoroappsException, IOException {
		if (files != null) {
			for (MultipartFile file : files) {
				try (InputStream inputStream = file.getInputStream()) {
					String imageKey = new StringBuilder("organization-profile/").append(customers.getId().toString())
							.append(LocalTime.now()).toString();
					fileManagerService.uploadFileForOrganization(imageKey, file.getInputStream(), file.getSize(),
							customers.getTenantId());

					String originalFilename = file.getOriginalFilename();
					if (originalFilename != null && originalFilename.contains("uploadLogo")) {
						customerVO.setLogo(imageKey);
					}
				}
			}
		}

		UsersVO userVO = UsersVO.builder().userName(customerVO.getUserEmailId())
				.subject(" Welcomes you to join Yoroflow ").recipientEmails(customerVO.getContactEmailId())
				.messageBody(customerVO.getUserEmailId()).password(customerVO.getPassword())
				.inviteUser("invite first user").build();
		userService.inviteFirstUser(userVO, customerVO);
		userService.sendEmailForSales(userVO, customerVO);
	}

	private void saveOrUpdateApplicationLogo(List<MultipartFile> files, Customers customers) throws IOException {
		for (MultipartFile file : files) {
			try (InputStream inputStream = file.getInputStream()) {
				String imageKey = new StringBuilder("organization-profile/").append(customers.getId().toString())
						.append(LocalTime.now()).toString();
				fileManagerService.uploadFileForOrganization(imageKey, file.getInputStream(), file.getSize(),
						customers.getTenantId());

				String originalFilename = file.getOriginalFilename();
				if (originalFilename != null && originalFilename.contains("uploadLogo")) {
					customers.setLogo(imageKey);
				} else if (originalFilename != null && originalFilename.contains("uploadBackgroudImage")) {
					customers.setBackgroundImage(imageKey);
				}
				customersRepository.save(customers);
			}
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public CustomersVO getCustomerInfo(String tenantId) throws IOException {
		Customers customers = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(tenantId,
				YoroappsConstants.YES);
		if (customers != null) {
			return constructConsumerDTOToVO(customers);
		}
		return CustomersVO.builder().build();
	}

	public CustomersVO getCustomeInfoById(UUID id) throws IOException {
		Customers customer = customersRepository.findByIdAndActiveFlagIgnoreCase(id, YoroappsConstants.YES);
		return constructConsumerDTOToVO(customer);
	}

	public CustomersVO getCustomerInfoByDomain(String domain) throws IOException {
		Customers customers = customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(domain,
				YoroappsConstants.YES);
		return constructConsumerDTOToVO(customers);
	}

	public ResponseStringVO getCustomersLogo() throws IOException {
		Customers customers = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		String response = null;
		if (customers != null && customers.getLogo() != null) {
			response = getOrganizationProfilePicture(customers);
		}
		return ResponseStringVO.builder().response(response).build();
	}

	private String getOrganizationLogoAndBackground(Customers customers, Boolean logo) throws IOException {
		String profile = null;
		if (StringUtils.isNotBlank(customers.getLogo()) && logo.booleanValue()) {
			profile = DATA_IMAGE_JPEG_BASE64 + Base64.getEncoder().encodeToString(
					fileManagerService.downloadFileForOrganization(customers.getLogo(), customers.getTenantId()));
		}
		if (StringUtils.isNotBlank(customers.getBackgroundImage()) && !logo.booleanValue()) {
			profile = DATA_IMAGE_JPEG_BASE64 + Base64.getEncoder().encodeToString(fileManagerService
					.downloadFileForOrganization(customers.getBackgroundImage(), customers.getTenantId()));
		}
		return profile;
	}

	private String getOrganizationProfilePicture(Customers customers) throws IOException {
		String profile = null;
		if (StringUtils.isNotBlank(customers.getLogo())) {
			profile = DATA_IMAGE_JPEG_BASE64 + Base64.getEncoder().encodeToString(
					fileManagerService.downloadFileForOrganization(customers.getLogo(), customers.getTenantId()));
		} else {
			profile = customers.getLogo();
		}
		return profile;
	}

	@Transactional
	public ResponseStringVO checkSubdomainName(CustomersVO customerVo) {
		String message = null;
		if (StringUtils.isNotBlank(customerVo.getSubdomainName())) {
			Customers subdomainName = customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(
					customerVo.getSubdomainName(), YoroappsConstants.YES);

			if (subdomainName != null) {
				message = "Subdomain Name " + "[" + customerVo.getSubdomainName() + "]" + " already exists";
			}
			return ResponseStringVO.builder().response(message).build();
		}
		return ResponseStringVO.builder().response("Invalid Subdomain Name").build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO checkSubdomainNameForAccountCreation(String subDomainName) {
		Customers subdomainName = customersRepository
				.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(subDomainName, YoroappsConstants.YES);

		if (subdomainName != null) {
			return ResponseStringVO.builder()
					.response("Subdomain Name " + "[" + subDomainName + "]" + " already exists").build();
		}
		return ResponseStringVO.builder().response("proceed").build();
	}

	private String trim(String value) {
		return StringUtils.trimToEmpty(value).toLowerCase();
	}

	private String generateTenantId(Customers customer) {
		return "customer_" + String.format("%07d", customer.getCustomerNumber());
	}

	public ResponseStringVO getCustomerTheme() {
		Customers customers = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		String response = "yoro-theme";
		if (StringUtils.isNotBlank(customers.getThemeId())) {
			response = customers.getThemeId();
		}
		return ResponseStringVO.builder().response(response).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public Customers getCustomer(String domain) {
		return customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(domain, YoroappsConstants.YES);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO getCustomerLogo(String domain) throws IOException {
		String response = null;
		String backgroundImage = null;
		Organization customer = organizationRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(domain,
				YoroappsConstants.YES);
		if (customer != null) {
			if (StringUtils.isNotBlank(customer.getLogo())) {
				response = DATA_IMAGE_JPEG_BASE64
						+ Base64.getEncoder().encodeToString(fileManagerService.downloadFile(customer.getLogo()));
			} else {
				response = "Customer has no logo";
			}
			if (StringUtils.isNotBlank(customer.getBackgroundImage())) {
				try {
					backgroundImage = DATA_IMAGE_JPEG_BASE64 + Base64.getEncoder().encodeToString(fileManagerService
							.downloadFileForOrganization(customer.getBackgroundImage(), customer.getTenantId()));
				} catch (IOException e) {
					throw new IOException("Image Not Found");
				}
			} else {
				backgroundImage = "Customer has no background image";
			}
			return ResponseStringVO.builder().response(response).backgroundImage(backgroundImage)
					.responseId(customer.getOrgName()).build();
		}
		return ResponseStringVO.builder().build();
	}

	public boolean isTwoFactorEnabled(String twoFactor) {
		return StringUtils.equals(twoFactor, "true");
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO updateOrganization(CustomersVO customerVo, List<MultipartFile> file) throws IOException {
		String allowedDomains = null;
		if (customerVo.getAllowedDomainNames() != null && !customerVo.getAllowedDomainNames().isEmpty()) {
			allowedDomains = String.join(",", customerVo.getAllowedDomainNames());
		}

		Customers updateCustomer = organizationService.getCustomer(customerVo);
		updateCustomer.setOrgName(customerVo.getOrgName());
		updateCustomer.setAllowedDomainNames(trim(allowedDomains));
		updateCustomer.setSubdomainName(trim(customerVo.getSubdomainName()));
		updateCustomer.setOrganizationUrl(customerVo.getOrganizationUrl());
		if (StringUtils.isNotBlank(customerVo.getTimezone())) {
			updateCustomer.setTimezone(customerVo.getTimezone());
		}
		updateCustomer.setTrialStartDate(customerVo.getStartDate());
		updateCustomer.setTrialEndDate(customerVo.getEndDate());
		if (!StringUtils.equalsIgnoreCase(customerVo.getType(), "userUpdate")) {
			updateCustomer.setDefaultLanguge(customerVo.getDefaultLanguge());
			updateCustomer.setActualDomainName(trim(customerVo.getActualDomainName()));
			updateCustomer.setServerFarm(customerVo.getServerFarm());
			updateCustomer.setDatasourceName(customerVo.getDataSourceName());
		}

		if (file != null) {
			saveOrUpdateApplicationLogo(file, updateCustomer);
		}
		updateCustomer.setThemeId(customerVo.getThemeId());
		customersRepository.save(updateCustomer);

		String currentTenantId = YorosisContext.get().getTenantId();
		try {
			YorosisContext.get().setTenantId(updateCustomer.getTenantId());
			OrganizationVO organizationVO = OrganizationVO.builder()
					.allowedDomainNames(customerVo.getAllowedDomainNames()).orgName(customerVo.getOrgName())
					.organizationUrl(customerVo.getOrganizationUrl()).subdomainName(customerVo.getSubdomainName())
					.themeId(customerVo.getThemeId()).timezone(customerVo.getTimezone()).type(customerVo.getType())
					.build();

			organizationService.updateOrganizationFromCustomer(organizationVO, file);
		} finally {
			YorosisContext.get().setTenantId(currentTenantId);
		}

		return ResponseStringVO.builder().response("Your Organization Updated Successfully").build();
	}

	@Transactional
	public ResponseStringVO updateDiscount(CustomersVO customerVo) {
		Customers updateCustomer = organizationService.getCustomer(customerVo);
		if (customerVo.getOrganizationDiscountList() != null) {
			organizationDiscountService.saveDiscount(customerVo.getOrganizationDiscountList(), updateCustomer);
			return ResponseStringVO.builder().response("Plan details updated successfully").build();
		}
		return ResponseStringVO.builder().response("Invalid Data").build();
	}

	@Transactional
	public ResponseStringVO updatePackageDetails(CustomersVO customerVo) {
		Customers updateCustomer = organizationService.getCustomer(customerVo);
		if (updateCustomer != null) {
			updateCustomer.setTrialStartDate(customerVo.getStartDate());
			updateCustomer.setTrialEndDate(customerVo.getEndDate());
			customersRepository.save(updateCustomer);

			List<OrgSubscription> orgSubscriptionList = orgSubscriptionRepository.getOrgSubscriptionBasedOnCustomerId(
					updateCustomer.getId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);

			if (!orgSubscriptionList.isEmpty()) {
				List<OrgSubscription> list = orgSubscriptionList.stream()
						.filter(t -> StringUtils.equals(t.getActivePlan(), YoroappsConstants.YES))
						.collect(Collectors.toList());
				if (!list.isEmpty()) {
					OrgSubscription orgSubscription = list.get(0);
					if (orgSubscription != null) {
						PaymentSubscriptionDetails paymentSubscriptionDetails = paymentSubscriptionDetailsRepository
								.getbyNameAndPaymentSubscriptionDetails(updateCustomer.getId(),
										customerVo.getOrgPlanType(), YoroappsConstants.YES);
						return setOrgSubscription(updateCustomer, customerVo, orgSubscription,
								paymentSubscriptionDetails);
					}
				}
			}
		}
		return ResponseStringVO.builder().response("Invalid Data").build();
	}

	@Transactional
	private ResponseStringVO setOrgSubscription(Customers updateCustomer, CustomersVO customerVo,
			OrgSubscription orgSubscription, PaymentSubscriptionDetails paymentSubscriptionDetails) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		if (paymentSubscriptionDetails != null) {
			if (orgSubscription != null) {
				orgSubscription.setPlanType(paymentSubscriptionDetails);
				orgSubscription.setUpdatedDate(timestamp);
				orgSubscription.setUpdatedBy(YorosisContext.get().getUserName());

				if (customerVo.getStartDate() != null && customerVo.getEndDate() != null) {
					orgSubscription.setSubscriptionStartDate(customerVo.getStartDate());
					orgSubscription.setSubscriptionEndDate(customerVo.getEndDate());
				}

				setBillingTypeAndAmount(customerVo, orgSubscription, paymentSubscriptionDetails);
				orgSubscriptionRepository.save(orgSubscription);
				return ResponseStringVO.builder().response("Package Details Updated Successfully").build();
			} else {
				savePackageDetails(customerVo, updateCustomer);
			}
		}
		return ResponseStringVO.builder().response("Invalid Data").build();
	}

	private void setBillingTypeAndAmount(CustomersVO customerVo, OrgSubscription orgSubscription,
			PaymentSubscriptionDetails paymentSubscriptionDetails) {
		if (StringUtils.isNotBlank(customerVo.getOrgBillingType())) {
			orgSubscription.setBillingType(customerVo.getOrgBillingType());
			if (StringUtils.equals(customerVo.getOrgBillingType(), MONTHLY)) {
				orgSubscription.setSubscriptionAmount(paymentSubscriptionDetails.getMonthlyPrice());
			} else if (StringUtils.equals(customerVo.getOrgBillingType(), YEARLY)) {
				orgSubscription.setSubscriptionAmount(paymentSubscriptionDetails.getYearlyPrice());
			}
		} else {
			orgSubscription.setBillingType(MONTHLY);
			orgSubscription.setSubscriptionAmount(paymentSubscriptionDetails.getMonthlyPrice());
		}
	}

}
