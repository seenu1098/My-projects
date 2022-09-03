package com.yorosis.yoroflow.creation.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.net.URISyntaxException;
import java.net.URL;
import java.sql.Date;
import java.sql.Timestamp;
import java.text.DecimalFormat;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Address;
import com.stripe.model.Customer;
import com.stripe.model.Invoice;
import com.stripe.model.PaymentIntent;
import com.stripe.model.PaymentMethod;
import com.stripe.model.Price;
import com.stripe.model.Product;
import com.stripe.model.Subscription;
import com.stripe.model.SubscriptionSchedule;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.CustomerUpdateParams;
import com.stripe.param.PaymentMethodAttachParams;
import com.stripe.param.PaymentMethodCreateParams;
import com.stripe.param.PaymentMethodUpdateParams;
import com.stripe.param.PriceCreateParams;
import com.stripe.param.SubscriptionCreateParams;
import com.stripe.param.SubscriptionScheduleCreateParams;
import com.stripe.param.SubscriptionUpdateParams;
import com.yorosis.yoroapps.automation.Email;
import com.yorosis.yoroapps.automation.EmailPerson;
import com.yorosis.yoroapps.entities.CustomerPayment;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.PaymentCustomerDetails;
import com.yorosis.yoroapps.entities.PaymentSettings;
import com.yorosis.yoroapps.entities.PaymentSubscriptionDetails;
import com.yorosis.yoroapps.vo.CustomerPaymentVO;
import com.yorosis.yoroapps.vo.FileUploadVo;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroflow.creation.config.RabbitConfig;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.CustomerPaymentRepository;
import com.yorosis.yoroflow.creation.repository.CustomersRepository;
import com.yorosis.yoroflow.creation.repository.PaymentCustomerDetailsRepository;
import com.yorosis.yoroflow.creation.repository.PaymentSettingsRepository;
import com.yorosis.yoroflow.creation.repository.PaymentSubscriptionDetailsRepository;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class CustomerPaymentService {
	private static final DecimalFormat NUMBER_FORMAT = new DecimalFormat("#.#####");

	private static final String YEARLY = "yearly";
	private static final String MONTHLY = "monthly";
	private static final String STRIPE_KEY = "Stripe Key";
	private static final String EMAIL = "sales@yoroflow.com";

	@Value("${api.stripe.key}")
	private String stripeApiKey;

	@Autowired
	private StringEncryptor jasyptEncryptor;

	@Autowired
	private UserService userService;

	@Autowired
	private FileManagerService fileManagerService;

	@Autowired
	private CustomerPaymentRepository customerPaymentRepository;

	@Autowired
	private PaymentCustomerDetailsRepository paymentCustomerDetailsRepository;

	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private PaymentSettingsRepository paymentSettingsRepository;

	@Autowired
	private PaymentSubscriptionDetailsRepository paymentSubscriptionDetailsRepository;

	@Autowired
	private RabbitTemplate publisherTemplate;

	public PaymentSettings getPaymentSettings() {
		return paymentSettingsRepository.findByStripeKeyNameAndTenantIdAndActiveFlag(STRIPE_KEY,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
	}

	public Customers getCustomerInfoByTenantId(String tenantId) throws IOException {
		Customers customers = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(tenantId,
				YoroappsConstants.YES);
		if (customers != null) {
			return customers;
		} else {
			return null;
		}
	}

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
	public ResponseStringVO paymentProcess(CustomerPaymentVO customerPaymentVO, String tenantId, UsersVO userVO)
			throws StripeException, IOException, URISyntaxException {

		try {

			PaymentSettings paymentSettings = getPaymentSettings();
			if (paymentSettings == null) {
				return ResponseStringVO.builder().response("Stripe Key not created").build();
			}

			Stripe.apiKey = jasyptEncryptor.decrypt(paymentSettings.getSecretKey());

			Customers orgCustomers = getCustomerInfoByTenantId(tenantId);

			Product product = null;

			if (StringUtils.isNotBlank(orgCustomers.getPaymentCustomerId())) {
				customerPaymentVO.setPaymentCustomerId(orgCustomers.getPaymentCustomerId());
			} else {
				String paymentCustomerId = setupPaymentSetupFromOrganization(customerPaymentVO.getEmail(), tenantId);
				if (StringUtils.isNotBlank(paymentCustomerId)) {
					customerPaymentVO.setPaymentCustomerId(paymentCustomerId);
				} else {
					return ResponseStringVO.builder().response("Stripe Customer Creation Failed").build();
				}
			}

			Customer customer = null;

			if (StringUtils.isNotBlank(orgCustomers.getPaymentCustomerId())) {
				customer = Customer.retrieve(orgCustomers.getPaymentCustomerId());
			} else {
				customer = Customer.retrieve(customerPaymentVO.getPaymentCustomerId());
			}

			log.info("customer:{}", customer);

			if (customer != null) {

				List<CustomerPayment> paymentList = customerPaymentRepository
						.findByPaymentCustomerIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(customer.getId(),
								"yoroflow", YoroappsConstants.YES);

				Subscription retriveSubscription = null;
				if (paymentList != null && !paymentList.isEmpty()
						&& paymentList.get(0).getPaymentSubscriptionId() != null) {
					retriveSubscription = Subscription.retrieve(paymentList.get(0).getPaymentSubscriptionId());
					if (retriveSubscription != null) {
						paymentList.stream().forEach(t -> {
							t.setActiveFlag(YoroappsConstants.NO);
						});
						customerPaymentRepository.saveAll(paymentList);
						com.stripe.param.PriceCreateParams.Recurring recurringParams = PriceCreateParams.Recurring
								.builder().build();
						if (StringUtils.equals(customerPaymentVO.getBillingType(), YEARLY)) {
							recurringParams = PriceCreateParams.Recurring.builder()
									.setInterval(PriceCreateParams.Recurring.Interval.YEAR).build();

						} else if (StringUtils.equals(customerPaymentVO.getBillingType(), MONTHLY)) {
							recurringParams = PriceCreateParams.Recurring.builder()
									.setInterval(PriceCreateParams.Recurring.Interval.MONTH).build();

						}
						Float setAmount = setAmount(customerPaymentVO, orgCustomers);

						BigDecimal valueOf = new BigDecimal(String.valueOf(setAmount));
						log.info("setAmount:{}", setAmount);
						log.info("valueOf:{}", valueOf);
						Map<String, Object> productParams = new HashMap<>();
						productParams.put("name", "YOROFLOW - " + customerPaymentVO.getPlanType());

						product = Product.create(productParams);
						PriceCreateParams priceParams = PriceCreateParams.builder().setProduct(product.getId())
								.setUnitAmountDecimal(valueOf).setCurrency("USD").setRecurring(recurringParams).build();

						Price price = Price.create(priceParams);
						SubscriptionUpdateParams subscriptionUpdateParams = null;
						long setQuantity = 0;
						if (BooleanUtils.isTrue(customerPaymentVO.getIsUpgradeSubscription())) {
							setQuantity = customerPaymentVO.getQuantity();
						} else {
							if (retriveSubscription.getItems().getData().get(0).getQuantity() != 0L) {
								setQuantity = setQuantity(orgCustomers)
										+ retriveSubscription.getItems().getData().get(0).getQuantity();
							} else {
								setQuantity = setQuantity(orgCustomers);
							}
						}

						// checked for immediate subscrition
//						LocalDateTime now = LocalDateTime.now();
						//
//						java.util.Date from = Date.from(now.atZone(ZoneId.systemDefault()).toInstant());
//						Date date = new Date((from.getTime() + (1 * 60 * 1000)) / 1000);

						subscriptionUpdateParams = SubscriptionUpdateParams.builder().setCancelAtPeriodEnd(false)
								.setProrationBehavior(SubscriptionUpdateParams.ProrationBehavior.ALWAYS_INVOICE)
								.addItem(SubscriptionUpdateParams.Item.builder()
										.setId(retriveSubscription.getItems().getData().get(0).getId())
										.setPrice(price.getId()).setQuantity(setQuantity).build())
								.build();

						PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentList.get(0).getPaymentMethodId());
						Subscription subscription = retriveSubscription.update(subscriptionUpdateParams);

						return setSubscription(subscription, customerPaymentVO, tenantId, orgCustomers, paymentMethod,
								customer, userVO);
					}
				} else {
					PaymentMethodCreateParams paymentMethodCreateParams = PaymentMethodCreateParams.builder()
							.setCard(PaymentMethodCreateParams.CardDetails.builder()
									.setNumber(customerPaymentVO.getCardNumber())
									.setExpMonth(Long.valueOf(customerPaymentVO.getExpMonth()))
									.setExpYear(Long.valueOf(customerPaymentVO.getExpYear()))
									.setCvc(customerPaymentVO.getCvv()).build())
							.setBillingDetails(PaymentMethodCreateParams.BillingDetails.builder()
									.setAddress(PaymentMethodCreateParams.BillingDetails.Address.builder()
											.setLine1(customerPaymentVO.getAddressLine1())
											.setLine2(customerPaymentVO.getAddressLine2())
											.setCountry(customerPaymentVO.getCountry())
											.setState(customerPaymentVO.getState()).setCity(customerPaymentVO.getCity())
											.setPostalCode(customerPaymentVO.getPostalCode()).build())
									.setEmail(customerPaymentVO.getEmail()).setPhone(customerPaymentVO.getPhone())
									.build())
							.setType(PaymentMethodCreateParams.Type.CARD).build();

					PaymentMethod paymentMethod = PaymentMethod.create(paymentMethodCreateParams);

					paymentMethod.attach(PaymentMethodAttachParams.builder().setCustomer(customer.getId()).build());

					log.info("paymentMethod:{}", paymentMethod);

					CustomerUpdateParams customerParams = CustomerUpdateParams.builder()
							.setInvoiceSettings(CustomerUpdateParams.InvoiceSettings.builder()
									.setDefaultPaymentMethod(paymentMethod.getId()).build())
							.setName(userVO.getFirstName() + " " + userVO.getLastName())
							.setAddress(
									CustomerUpdateParams.Address.builder().setLine1(customerPaymentVO.getAddressLine1())
											.setLine2(customerPaymentVO.getAddressLine2())
											.setCountry(customerPaymentVO.getCountry())
											.setState(customerPaymentVO.getState()).setCity(customerPaymentVO.getCity())
											.setPostalCode(customerPaymentVO.getPostalCode()).build())
							.setPhone(customerPaymentVO.getPhone()).build();

					Customer updatedCustomer = customer.update(customerParams);
					com.stripe.param.PriceCreateParams.Recurring recurringParams = PriceCreateParams.Recurring.builder()
							.build();

					if (StringUtils.equals(customerPaymentVO.getBillingType(), YEARLY)) {
						recurringParams = PriceCreateParams.Recurring.builder()
								.setInterval(PriceCreateParams.Recurring.Interval.YEAR).build();

					} else if (StringUtils.equals(customerPaymentVO.getBillingType(), MONTHLY)) {
						recurringParams = PriceCreateParams.Recurring.builder()
								.setInterval(PriceCreateParams.Recurring.Interval.MONTH).build();

					}
					Float setAmount = setAmount(customerPaymentVO, orgCustomers);

					BigDecimal valueOf = new BigDecimal(String.valueOf(setAmount));

					log.info("setAmount:{}", setAmount);
					log.info("valueOf:{}", valueOf);
					Map<String, Object> productParams = new HashMap<>();
					productParams.put("name", "YOROFLOW - " + customerPaymentVO.getPlanType());

					product = Product.create(productParams);
					PriceCreateParams priceParams = PriceCreateParams.builder().setProduct(product.getId())
							.setUnitAmountDecimal(valueOf).setCurrency("USD").setRecurring(recurringParams).build();

					Price price = Price.create(priceParams);
					SubscriptionCreateParams subscriptionParams = null;

					// checked for immediate subscrition
//				LocalDateTime now = LocalDateTime.now();
//
//				java.util.Date from = Date.from(now.atZone(ZoneId.systemDefault()).toInstant());
//				Date date = new Date((from.getTime() + (1 * 60 * 1000)) / 1000);
					long setQuantity = 0;
					if (BooleanUtils.isTrue(customerPaymentVO.getIsUpgradeSubscription())) {
						setQuantity = customerPaymentVO.getQuantity();
					} else {
						setQuantity = setQuantity(orgCustomers);
					}

					subscriptionParams = SubscriptionCreateParams.builder().setCustomer(updatedCustomer.getId())
							.addItem(SubscriptionCreateParams.Item.builder().setPrice(price.getId())
									.setQuantity(setQuantity).build())
							.build();

					Subscription subscription = Subscription.create(subscriptionParams);
					log.info("subscription:{}", subscription);
					return setSubscription(subscription, customerPaymentVO, tenantId, orgCustomers, paymentMethod,
							updatedCustomer, userVO);
				}
			}

		} catch (Exception ex) {
			return ResponseStringVO.builder().response(ex.getMessage()).build();
		}
		return ResponseStringVO.builder().response("Payment is incompleted, please try again later").build();
	}

	@Transactional
	public ResponseStringVO sendEmailForSales(UsersVO userVo, Customers orgCustomers, String message) {

		Map<String, String> templateMap = new HashMap<>();
		templateMap.put("subdomainName", orgCustomers.getSubdomainName());
		templateMap.put("username", userVo.getUserName());
		templateMap.put("content", message);

		Set<EmailPerson> setEmailPerson = new HashSet<>();
		setEmailPerson.add(EmailPerson.builder().emailId(EMAIL).build());
		Email email = Email.builder().tenantId(YorosisContext.get().getTenantId()).isHTML(true)
				.templateBodyId("subscriptionInformation").templateValues(templateMap).toRecipientList(setEmailPerson)
				.build();
		publishToEmail(email);
		return ResponseStringVO.builder().response("message sent successfully").build();

	}

	@Transactional
	public void publishToEmail(Email email) {
		try {
			log.info("### pushed to email {}", email);
			publisherTemplate.convertAndSend(RabbitConfig.DEFAULT_EXCHANGE, RabbitConfig.EMAIL_QUEUE, email);
		} catch (Exception ex) {
			// Ignore the error when the error happens as it shouldn't stop the process
			log.error("Unable to post in the queue", ex);
		}
	}

	private ResponseStringVO setSubscription(Subscription subscription, CustomerPaymentVO customerPaymentVO,
			String tenantId, Customers orgCustomers, PaymentMethod paymentMethod, Customer customer, UsersVO userVO)
			throws IOException, StripeException {

		String response = null;
		Date startDate = null;
		Date endDate = null;
		String message = null;
		if (subscription != null) {
			startDate = new Date(subscription.getCurrentPeriodStart() * 1000);
			endDate = new Date(subscription.getCurrentPeriodEnd() * 1000);
			if (StringUtils.equalsAnyIgnoreCase(subscription.getStatus(), "active", "trialing")) {

				Invoice retriveInvoice = Invoice.retrieve(subscription.getLatestInvoice());
				String invoicePdf = retriveInvoice.getInvoicePdf();
				String newStr = invoicePdf.replace("https://pay.stripe.com/invoice/",
						"https://invoicedata.stripe.com/invoice_receipt_file_url/").replace("/pdf", "");

				URL url = new URL(newStr);

				InputStream is = url.openConnection().getInputStream();
				BufferedReader reader = new BufferedReader(new InputStreamReader(is));

				String line = null;
				String asText = null;
				while ((line = reader.readLine()) != null) {
					ObjectMapper mapper = new ObjectMapper();
					JsonNode node = mapper.readTree(line);
					asText = node.get("file_url").asText();
				}
				reader.close();

				URL fileUrl = new URL(asText);

				byte[] byteArray = IOUtils.toByteArray(fileUrl.openStream());

				String fileKey = new StringBuilder(UUID.randomUUID().toString()).append(LocalTime.now()).toString();
				FileUploadVo fileUploadVO = FileUploadVo.builder().key(fileKey).contentSize(byteArray.length)
						.inputStream(byteArray).contentType("application/pdf").build();
				fileManagerService.uploadFileFromVo(fileUploadVO);

				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				CustomerPayment payment = CustomerPayment.builder().tenantId(YorosisContext.get().getTenantId())
						.createdBy(YorosisContext.get().getUserName()).modifiedBy(YorosisContext.get().getUserName())
						.modifiedOn(timestamp).createdOn(timestamp).activeFlag(YoroappsConstants.YES)
						.paymentAmount(
								BigDecimal.valueOf(retriveInvoice.getAmountPaid()).movePointLeft(2).doubleValue())
						.paymentDate(timestamp).paymentCustomerId(customerPaymentVO.getPaymentCustomerId())
						.paymentSubscriptionId(subscription.getId()).invoicePdf(fileKey)
						.quantity(subscription.getItems().getData().get(0).getQuantity())
						.paymentMethod(
								paymentMethod.getCard().getBrand() + " ending in " + paymentMethod.getCard().getLast4())
						.paymentPriceId(retriveInvoice.getLines().getData().get(0).getPrice().getId())
						.paymentType(paymentMethod.getType()).paymentMethodId(paymentMethod.getId()).build();

				if (orgCustomers != null && StringUtils.isNotBlank(orgCustomers.getOrgName())) {
					payment.setDescription(orgCustomers.getOrgName());
				} else {
					payment.setDescription(customerPaymentVO.getEmail());
				}

				if (retriveInvoice.getPaymentIntent() != null) {
					PaymentIntent paymentIntent = PaymentIntent.retrieve(retriveInvoice.getPaymentIntent());
					log.info("paymentIntent:{}", paymentIntent);
					if (paymentIntent != null) {
						payment.setIsPaymentSucceed(
								StringUtils.equals(paymentIntent.getStatus(), "succeeded") ? YoroappsConstants.YES
										: YoroappsConstants.NO);
					}
				}

				PaymentCustomerDetails paymentCustomerDetails = PaymentCustomerDetails.builder()
						.addressLine1(customerPaymentVO.getAddressLine1())
						.addressLine2(customerPaymentVO.getAddressLine2()).city(customerPaymentVO.getCity())
						.state(customerPaymentVO.getState()).country(customerPaymentVO.getCountry())
						.postalCode(customerPaymentVO.getPostalCode()).email(customerPaymentVO.getEmail())
						.phone(customerPaymentVO.getPhone()).customerPayment(payment).activeFlag(YoroappsConstants.YES)
						.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
						.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).createdOn(timestamp)
						.build();

				customerPaymentRepository.save(payment);

				paymentCustomerDetailsRepository.save(paymentCustomerDetails);

				Customers customers = customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(tenantId,
						YoroappsConstants.YES);
				if (customers != null) {
					customers.setIsPayingCustomer(YoroappsConstants.YES);
					customers.setSubscriptionStartDate(startDate);
					customers.setSubscriptionEndDate(endDate);
					if (BooleanUtils.isTrue(customerPaymentVO.getIsUpgradeSubscription())) {
						customers.setMaximunUsers(customerPaymentVO.getQuantity().intValue());
					}
					customersRepository.save(customers);
				}

				if (BooleanUtils.isTrue(customerPaymentVO.getIsUpgradeSubscription())) {
					message = "User upgraded from " + customerPaymentVO.getPreviousPlan() + "(TRIAL) to "
							+ customerPaymentVO.getPlanType();
				} else {
					message = "User upgraded from " + customerPaymentVO.getPreviousPlan() + " to "
							+ customerPaymentVO.getPlanType();
				}

				sendEmailForSales(userVO, orgCustomers, message);
				response = "Payment processed";
			} else if (StringUtils.equals(subscription.getStatus(), "incomplete")) {
				response = "Previous payment is incomplete, please try again later";
			} else if (StringUtils.equalsAnyIgnoreCase(subscription.getStatus(), "incomplete_expired", "unpaid",
					"canceled", "past_due")) {
				response = "your payment is terminated, please try again later";
			} else {
				response = "Payment is incompleted, please try again later";
			}
		}
		return ResponseStringVO.builder().response(response).startDate(startDate).endDate(endDate)
				.customerPaymentId(customer.getId()).build();
	}

	private long setQuantity(Customers customers) {
		return Long.valueOf(customers.getMaximunUsers());
	}

	private Float setAmount(CustomerPaymentVO customerPaymentVO, Customers customers) {
		List<PaymentSubscriptionDetails> planDetailsList = paymentSubscriptionDetailsRepository
				.getPaymentSubscriptionDetails(customers.getId(), YorosisContext.get().getTenantId(),
						YoroappsConstants.YES);
//		monthly = base + (month * du);
//		yearly = (base * 12) + (year * 12 * du);
		Float amount = null;
		PaymentSubscriptionDetails paymentSubscriptionDetails = planDetailsList.stream()
				.filter(t -> StringUtils.equals(t.getPlanName(), customerPaymentVO.getPlanType()))
				.collect(Collectors.toList()).get(0);
		if (StringUtils.equals(customerPaymentVO.getBillingType(), "monthly")) {
			amount = (paymentSubscriptionDetails.getBasePrice()
					+ (paymentSubscriptionDetails.getMonthlyPrice() * customers.getMaximunUsers()));
		} else if (StringUtils.equals(customerPaymentVO.getBillingType(), "yearly")) {
			amount = ((paymentSubscriptionDetails.getBasePrice() * 12)
					+ (12 * paymentSubscriptionDetails.getYearlyPrice() * customers.getMaximunUsers()));
		}
		Float am = amount / customers.getMaximunUsers();
		return (am * 100);
	}

	public Long getTotalQuantity(String paymentCustomerId, String tenantId) {
		return customerPaymentRepository.getTotalQuantity(paymentCustomerId, tenantId, YoroappsConstants.YES);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO addAdditionalUsers(CustomerPaymentVO customerPaymentVO, String tenantId)
			throws StripeException, IOException {

		PaymentSettings paymentSettings = getPaymentSettings();
		if (paymentSettings == null) {
			return ResponseStringVO.builder().response("Stripe Key not created").build();
		}

		Stripe.apiKey = jasyptEncryptor.decrypt(paymentSettings.getSecretKey());
		Customer customer = Customer.retrieve(customerPaymentVO.getPaymentCustomerId());

		if (customer != null) {
			CustomerPayment paymentDetails = getPaymentDetailsForSubscription(customer.getId(), "yoroflow");

			if (paymentDetails != null && paymentDetails.getPaymentSubscriptionId() != null) {
				Long previousQuantity = 0L;
				List<CustomerPayment> paymentList = customerPaymentRepository
						.findByPaymentCustomerIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
								customerPaymentVO.getPaymentCustomerId(), "yoroflow", YoroappsConstants.YES);
				if (paymentList != null && !paymentList.isEmpty()
						&& StringUtils.isNotBlank(paymentList.get(0).getPaymentSubscriptionId())) {

					Subscription subscription = Subscription.retrieve(paymentList.get(0).getPaymentSubscriptionId());

					previousQuantity = subscription != null ? subscription.getItems().getData().get(0).getQuantity()
							: 0L;
				}
				Long quantity = previousQuantity + customerPaymentVO.getQuantity();
				Subscription subscription = Subscription.retrieve(paymentDetails.getPaymentSubscriptionId());
				if (subscription != null) {
					SubscriptionUpdateParams subscriptionUpdateParams = SubscriptionUpdateParams.builder()
							.setCancelAtPeriodEnd(subscription.getCancelAtPeriodEnd())
							.setProrationBehavior(SubscriptionUpdateParams.ProrationBehavior.ALWAYS_INVOICE)
							.addItem(SubscriptionUpdateParams.Item.builder()
									.setId(subscription.getItems().getData().get(0).getId())
									.setPrice(paymentDetails.getPaymentPriceId()).setQuantity(quantity).build())
							.build();
					Subscription updateSubscription = subscription.update(subscriptionUpdateParams);
					log.info("updateSubscription:{}", updateSubscription);
					if (updateSubscription != null) {

						Customers orgCustomers = getCustomerInfoByTenantId(tenantId);

						if (StringUtils.equalsAnyIgnoreCase(updateSubscription.getStatus(), "active", "trialing")) {

							Invoice retriveInvoice = Invoice.retrieve(updateSubscription.getLatestInvoice());

							log.info("retriveInvoice:{}", retriveInvoice);
							log.info("retriveInvoicePdf:{}", retriveInvoice.getHostedInvoiceUrl());

							String invoicePdf = retriveInvoice.getInvoicePdf();

							String newStr = invoicePdf
									.replace("https://pay.stripe.com/invoice/",
											"https://invoicedata.stripe.com/invoice_receipt_file_url/")
									.replace("/pdf", "");

							URL url = new URL(newStr);

							InputStream is = url.openConnection().getInputStream();
							BufferedReader reader = new BufferedReader(new InputStreamReader(is));

							String line = null;
							String asText = null;
							while ((line = reader.readLine()) != null) {
								ObjectMapper mapper = new ObjectMapper();
								JsonNode node = mapper.readTree(line);
								asText = node.get("file_url").asText();
							}
							reader.close();

							URL fileUrl = new URL(asText);

							byte[] byteArray = IOUtils.toByteArray(fileUrl.openStream());

							String fileKey = new StringBuilder(UUID.randomUUID().toString()).append(LocalTime.now())
									.toString();
							FileUploadVo fileUploadVO = FileUploadVo.builder().key(fileKey)
									.contentSize(byteArray.length).inputStream(byteArray).contentType("application/pdf")
									.build();
							fileManagerService.uploadFileFromVo(fileUploadVO);

							Timestamp timestamp = new Timestamp(System.currentTimeMillis());
							CustomerPayment payment = CustomerPayment.builder()
									.tenantId(YorosisContext.get().getTenantId())
									.createdBy(YorosisContext.get().getUserName())
									.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
									.createdOn(timestamp).activeFlag(YoroappsConstants.YES)
									.paymentAmount(BigDecimal.valueOf(retriveInvoice.getAmountPaid()).movePointLeft(2)
											.doubleValue())
									.paymentDate(timestamp).paymentCustomerId(customerPaymentVO.getPaymentCustomerId())
									.paymentSubscriptionId(subscription.getId()).invoicePdf(fileKey)
									.quantity(customerPaymentVO.getQuantity())

									.paymentPriceId(retriveInvoice.getLines().getData().get(0).getPrice().getId())
									.build();

							PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentDetails.getPaymentMethodId());

							if (paymentMethod != null) {
								payment.setPaymentMethod(paymentMethod.getCard().getBrand() + " ending in "
										+ paymentMethod.getCard().getLast4());
								payment.setPaymentMethodId(paymentMethod.getId());
								payment.setPaymentType(paymentMethod.getType());
							}

							if (retriveInvoice.getPaymentIntent() != null) {

								PaymentIntent paymentIntent = PaymentIntent.retrieve(retriveInvoice.getPaymentIntent());
								if (paymentIntent != null) {
									payment.setIsPaymentSucceed(
											StringUtils.equals(paymentIntent.getStatus(), "succeeded")
													? YoroappsConstants.YES
													: YoroappsConstants.NO);
								}
								if (orgCustomers != null && StringUtils.isNotBlank(orgCustomers.getOrgName())) {
									payment.setDescription(orgCustomers.getOrgName());
								} else {
									payment.setDescription(customerPaymentVO.getEmail());
								}

								customerPaymentRepository.save(payment);

								if (orgCustomers != null) {
									orgCustomers.setMaximunUsers(quantity.intValue());
									customersRepository.save(orgCustomers);
								}
								return ResponseStringVO.builder().response("Payment processed").build();
							} else {
								return ResponseStringVO.builder()
										.response("Payment is incomplete, please contact support@yoroflow.com").build();
							}
						} else if (StringUtils.equals(subscription.getStatus(), "incomplete")) {
							return ResponseStringVO.builder()
									.response("Previous payment is incomplete, please try again later").build();
						} else if (StringUtils.equalsAnyIgnoreCase(subscription.getStatus(), "incomplete_expired",
								"unpaid", "canceled", "past_due")) {
							return ResponseStringVO.builder()
									.response("your payment is terminated, please try again later").build();
						} else {
							return ResponseStringVO.builder().response("Payment is incompleted, please try again later")
									.build();
						}
					}
				}
			}
		}
		return ResponseStringVO.builder().response("Payment is incompleted, please try again later").build();
	}

	private CustomerPaymentVO constructCustomerPaymentDtoToVo(CustomerPayment customerPayment) {
		return CustomerPaymentVO.builder().id(customerPayment.getId()).paymentAmount(customerPayment.getPaymentAmount())
				.paymentDate(customerPayment.getPaymentDate()).paymentMethod(customerPayment.getPaymentMethod())
				.isPaymentSucceed(customerPayment.getIsPaymentSucceed()).createdOn(customerPayment.getCreatedOn())
				.build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public List<CustomerPaymentVO> getPaymentHistory(String paymentCustomerId, String tenantId) {
		List<CustomerPayment> paymentList = customerPaymentRepository
				.findByPaymentCustomerIdAndTenantIdIgnoreCase(paymentCustomerId, YorosisContext.get().getTenantId());
		return paymentList.stream().map(this::constructCustomerPaymentDtoToVo)
				.sorted(Comparator.comparing(CustomerPaymentVO::getCreatedOn)).collect(Collectors.toList());
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public byte[] getReceiptPdf(UUID id) throws IOException {
		CustomerPayment customerPayment = customerPaymentRepository
				.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(id, YorosisContext.get().getTenantId(),
						YorosisConstants.YES);
		if (customerPayment != null) {
			return fileManagerService.downloadFile(customerPayment.getInvoicePdf());
		}

		return null;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public CustomerPaymentVO getPaymentCardDetails(String paymentCustomerId, String tenantId) throws StripeException {

		PaymentSettings paymentSettings = getPaymentSettings();

		Stripe.apiKey = jasyptEncryptor.decrypt(paymentSettings.getSecretKey());

		List<CustomerPayment> paymentList = customerPaymentRepository
				.findByPaymentCustomerIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(paymentCustomerId,
						YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		if (!paymentList.isEmpty() && paymentList.get(0).getPaymentMethodId() != null) {
			PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentList.get(0).getPaymentMethodId());
			if (paymentMethod != null) {
				com.stripe.model.PaymentMethod.Card card = paymentMethod.getCard();
				Address address = paymentMethod.getBillingDetails().getAddress();
				return CustomerPaymentVO.builder().cardNumber(card.getLast4()).expMonth(card.getExpMonth().toString())
						.expYear(card.getExpYear().toString()).addressLine1(address.getLine1())

						.addressLine2(address.getLine2()).city(address.getCity()).country(address.getCountry())
						.postalCode(address.getPostalCode()).state(address.getState())
						.email(paymentMethod.getBillingDetails().getEmail())
						.phone(paymentMethod.getBillingDetails().getPhone()).build();
			}

		}
		return CustomerPaymentVO.builder().build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO downgradePlan(CustomerPaymentVO customerPaymentVO, String tenantId, UsersVO userVO)
			throws StripeException, IOException {

		PaymentSettings paymentSettings = getPaymentSettings();
		if (paymentSettings == null) {
			return ResponseStringVO.builder().response("Stripe Key not created").build();
		}

		Stripe.apiKey = jasyptEncryptor.decrypt(paymentSettings.getSecretKey());

		Map<String, Object> productParams = new HashMap<>();
		productParams.put("name", "YOROFLOW - " + customerPaymentVO.getPlanType());

		Product product = Product.create(productParams);

		Customers orgCustomers = getCustomerInfoByTenantId(tenantId);

		if (StringUtils.isBlank(customerPaymentVO.getPaymentCustomerId())) {
			String paymentCustomerId = setupPaymentSetupFromOrganization(customerPaymentVO.getEmail(), tenantId);
			if (StringUtils.isNotBlank(paymentCustomerId)) {
				customerPaymentVO.setPaymentCustomerId(paymentCustomerId);
			} else {
				return ResponseStringVO.builder().response("Stripe Customer Creation Failed").build();
			}

		}

		Customer customer = Customer.retrieve(customerPaymentVO.getPaymentCustomerId());

		log.info("customer:{}", customer);

		if (customer != null) {

			CustomerPayment paymentDetails = getPaymentDetailsForSubscription(customer.getId(), "yoroflow");
			Subscription retriveSubscription = null;
			if (paymentDetails != null && paymentDetails.getPaymentSubscriptionId() != null) {
				retriveSubscription = Subscription.retrieve(paymentDetails.getPaymentSubscriptionId());
				if (retriveSubscription != null) {
					SubscriptionUpdateParams params = SubscriptionUpdateParams.builder().setCancelAtPeriodEnd(true)
							.setProrationBehavior(SubscriptionUpdateParams.ProrationBehavior.NONE).build();
					retriveSubscription.update(params);
					com.stripe.param.PriceCreateParams.Recurring recurringParams = PriceCreateParams.Recurring.builder()
							.build();

					if (StringUtils.equals(customerPaymentVO.getBillingType(), YEARLY)) {
						recurringParams = PriceCreateParams.Recurring.builder()
								.setInterval(PriceCreateParams.Recurring.Interval.YEAR).build();

					} else if (StringUtils.equals(customerPaymentVO.getBillingType(), MONTHLY)) {
						recurringParams = PriceCreateParams.Recurring.builder()
								.setInterval(PriceCreateParams.Recurring.Interval.MONTH).build();

					}

					Float setAmount = setAmount(customerPaymentVO, orgCustomers);

					BigDecimal valueOf = new BigDecimal(String.valueOf(setAmount));

					PriceCreateParams priceParams = PriceCreateParams.builder().setProduct(product.getId())
							.setUnitAmountDecimal(valueOf).setCurrency("USD").setRecurring(recurringParams).build();

					Price price = Price.create(priceParams);
					SubscriptionScheduleCreateParams SubscriptionScheduleParams = SubscriptionScheduleCreateParams
							.builder().setCustomer(customer.getId())
							.setStartDate(retriveSubscription.getCurrentPeriodEnd())

							.setEndBehavior(
									SubscriptionScheduleCreateParams.EndBehavior.RELEASE)
							.addPhase(SubscriptionScheduleCreateParams.Phase.builder()
									.addItem(SubscriptionScheduleCreateParams.Phase.Item.builder()
											.setPrice(price.getId())
											.setQuantity(retriveSubscription.getItems().getData().get(0).getQuantity())
											.build())
									.build())
							.build();

					SubscriptionSchedule schedule = SubscriptionSchedule.create(SubscriptionScheduleParams);

					log.info("subscription:{}", schedule);
					if (schedule != null) {
						Date startDate = null;
						Date endDate = null;

						startDate = new Date(retriveSubscription.getCurrentPeriodEnd() * 1000);
						if (StringUtils.equals(customerPaymentVO.getBillingType(), YEARLY)) {
							endDate = Date.valueOf(startDate.toLocalDate().plusYears(1));
						} else {
							endDate = Date.valueOf(startDate.toLocalDate().plusMonths(1));
						}
						log.info("date:{}", startDate);
						log.info("date:{}", endDate);
						sendEmailForSales(userVO, orgCustomers, "User downgraded from "
								+ customerPaymentVO.getPreviousPlan() + " to " + customerPaymentVO.getPlanType());
						return ResponseStringVO.builder().response("Payment processed").startDate(startDate)
								.endDate(endDate).build();

					}
				} else {
					return ResponseStringVO.builder().response("Invalid Subscription id").build();
				}
			}

		} else {
			return ResponseStringVO.builder().response("Invalid Customer").build();
		}
		return ResponseStringVO.builder().response("Payment Incomplete").build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO updatePaymentCardDetails(CustomerPaymentVO customerPaymentVO, UsersVO userVO)
			throws StripeException, IOException {

		PaymentSettings paymentSettings = getPaymentSettings();

		Stripe.apiKey = jasyptEncryptor.decrypt(paymentSettings.getSecretKey());

		String response = null;

		List<CustomerPayment> paymentList = customerPaymentRepository
				.findByPaymentCustomerIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
						customerPaymentVO.getPaymentCustomerId(), YorosisContext.get().getTenantId(),
						YoroappsConstants.YES);

		if (!paymentList.isEmpty() && paymentList.get(0).getPaymentMethodId() != null) {
			PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentList.get(0).getPaymentMethodId());
			if (paymentMethod != null) {
				String customerId = customerPaymentVO.getPaymentCustomerId();
				Customer customer = Customer.retrieve(customerId);

				log.info("customer:{}", customer);

				String cardNumber = customerPaymentVO.getCardNumber();
				String lastFourDigits = cardNumber.substring(cardNumber.length() - 4);

				if (StringUtils.equals(lastFourDigits, paymentMethod.getCard().getLast4())) {
					PaymentMethodUpdateParams params = PaymentMethodUpdateParams.builder()
							.setCard(PaymentMethodUpdateParams.Card.builder()
									.setExpYear(Long.valueOf(customerPaymentVO.getExpYear()))
									.setExpMonth(Long.valueOf(customerPaymentVO.getExpMonth())).build())
							.setBillingDetails(PaymentMethodUpdateParams.BillingDetails.builder()
									.setAddress(PaymentMethodUpdateParams.BillingDetails.Address.builder()
											.setLine1(customerPaymentVO.getAddressLine1())
											.setLine2(customerPaymentVO.getAddressLine2())
											.setCity(customerPaymentVO.getCity())
											.setPostalCode(customerPaymentVO.getPostalCode())
											.setState(customerPaymentVO.getState())
											.setCountry(customerPaymentVO.getCountry()).build())
									.setEmail(customerPaymentVO.getEmail()).setPhone(customerPaymentVO.getPhone())
									.build())
							.build();
					PaymentMethod update = paymentMethod.update(params);

					log.info("paymentMethod:{}", update);

					response = update != null ? "Card details updated successfully" : "Invalid Data";
				} else {
					PaymentMethod detach = paymentMethod.detach();
					if (detach.getCustomer() == null) {
						PaymentMethodCreateParams paymentMethodCreateParams = PaymentMethodCreateParams.builder()
								.setCard(PaymentMethodCreateParams.CardDetails.builder()
										.setNumber(customerPaymentVO.getCardNumber())
										.setExpMonth(Long.valueOf(customerPaymentVO.getExpMonth()))
										.setExpYear(Long.valueOf(customerPaymentVO.getExpYear()))
										.setCvc(customerPaymentVO.getCvv()).build())
								.setBillingDetails(PaymentMethodCreateParams.BillingDetails.builder()
										.setAddress(PaymentMethodCreateParams.BillingDetails.Address.builder()
												.setLine1(customerPaymentVO.getAddressLine1())
												.setLine2(customerPaymentVO.getAddressLine2())
												.setCountry(customerPaymentVO.getCountry())
												.setState(customerPaymentVO.getState())
												.setCity(customerPaymentVO.getCity())
												.setPostalCode(customerPaymentVO.getPostalCode()).build())
										.setEmail(customerPaymentVO.getEmail()).setPhone(customerPaymentVO.getPhone())
										.build())
								.setType(PaymentMethodCreateParams.Type.CARD).build();

						PaymentMethod createPaymentMethod = PaymentMethod.create(paymentMethodCreateParams);

						if (createPaymentMethod != null) {
							createPaymentMethod
									.attach(PaymentMethodAttachParams.builder().setCustomer(customerId).build());
							CustomerUpdateParams customerParams = CustomerUpdateParams.builder()
									.setInvoiceSettings(CustomerUpdateParams.InvoiceSettings.builder()
											.setDefaultPaymentMethod(createPaymentMethod.getId()).build())
									.setName(userVO.getFirstName() + " " + userVO.getLastName())
									.setAddress(CustomerUpdateParams.Address.builder()
											.setLine1(customerPaymentVO.getAddressLine1())
											.setLine2(customerPaymentVO.getAddressLine2())
											.setCountry(customerPaymentVO.getCountry())
											.setState(customerPaymentVO.getState()).setCity(customerPaymentVO.getCity())
											.setPostalCode(customerPaymentVO.getPostalCode()).build())
									.setPhone(customerPaymentVO.getPhone()).build();

							Customer updatedCustomer = customer.update(customerParams);

							log.info("paymentMethod:{}", createPaymentMethod);
							log.info("updatedCustomer:{}", updatedCustomer);

							paymentList.stream().forEach(t -> {
								t.setPaymentMethodId(createPaymentMethod.getId());
							});
							customerPaymentRepository.saveAll(paymentList);
							response = updatedCustomer != null ? "Card details updated successfully" : "Invalid Data";
						}

					}
				}
			}
		}
		return ResponseStringVO.builder().response(response).build();
	}

	public Long getQuantity(Customers customers) throws StripeException {

		Long quantity = 0L;

		PaymentSettings paymentSettings = getPaymentSettings();

		Stripe.apiKey = jasyptEncryptor.decrypt(paymentSettings.getSecretKey());
		List<CustomerPayment> paymentList = customerPaymentRepository
				.findByPaymentCustomerIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(customers.getPaymentCustomerId(),
						"yoroflow", YoroappsConstants.YES);
		if (paymentList != null && !paymentList.isEmpty()
				&& StringUtils.isNotBlank(paymentList.get(0).getPaymentSubscriptionId())) {

			Subscription subscription = Subscription.retrieve(paymentList.get(0).getPaymentSubscriptionId());

			quantity = subscription != null ? subscription.getItems().getData().get(0).getQuantity() : 0L;
		}
		return quantity;

	}

	public Float getSubscriptionAmount(Customers customers) throws StripeException {

		Float amount = null;

		PaymentSettings paymentSettings = getPaymentSettings();

		Stripe.apiKey = jasyptEncryptor.decrypt(paymentSettings.getSecretKey());
		List<CustomerPayment> paymentList = customerPaymentRepository
				.findByPaymentCustomerIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(customers.getPaymentCustomerId(),
						"yoroflow", YoroappsConstants.YES);
		if (paymentList != null && !paymentList.isEmpty()
				&& StringUtils.isNotBlank(paymentList.get(0).getPaymentSubscriptionId())) {

			Subscription subscription = Subscription.retrieve(paymentList.get(0).getPaymentSubscriptionId());

			log.info("subscription:{}", subscription);

			if (subscription != null && StringUtils.isNotBlank(subscription.getLatestInvoice())) {
				Invoice invoice = Invoice.retrieve(subscription.getLatestInvoice());
				log.info("invoice:{}", invoice);
				if (invoice != null && invoice.getLines() != null && invoice.getLines().getData() != null
						&& !invoice.getLines().getData().isEmpty()) {

					if (StringUtils.equals(invoice.getBillingReason(), "subscription_update")) {
						int size = invoice.getLines().getData().size();

						amount = BigDecimal.valueOf(invoice.getLines().getData().get(size - 1).getAmount())
								.movePointLeft(2).floatValue();
					} else if (StringUtils.equals(invoice.getBillingReason(), "subscription_create")
							|| StringUtils.equals(invoice.getBillingReason(), "subscription_cycle")) {
						amount = BigDecimal.valueOf(invoice.getTotal()).movePointLeft(2).floatValue();
					}
				}
			}
		}
		return amount;

	}

}
