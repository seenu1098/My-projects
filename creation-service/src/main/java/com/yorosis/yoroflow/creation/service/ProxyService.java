package com.yorosis.yoroflow.creation.service;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;
import java.util.UUID;

import javax.mail.MessagingException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.stripe.exception.StripeException;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.InstallableApps;
import com.yorosis.yoroapps.vo.AccountDetailsVO;
import com.yorosis.yoroapps.vo.CustomerPaymentVO;
import com.yorosis.yoroapps.vo.CustomersVO;
import com.yorosis.yoroapps.vo.InstallableAppsVo;
import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroapps.vo.OrgSubscriptionVo;
import com.yorosis.yoroapps.vo.OrgSummaryReportVo;
import com.yorosis.yoroapps.vo.OrganizationDiscountVo;
import com.yorosis.yoroapps.vo.PlanDetailsListVo;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SubscriptionExpireVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroapps.vo.WorkspaceVO;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.repository.CustomersRepository;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ProxyService {

	@Autowired
	private CustomerService customerService;

	@Autowired
	private PaymentSubscriptionDetailsService paymentSubscriptionDetailsService;

	@Autowired
	private OrgSubscriptionService orgSubscriptionService;

	@Autowired
	private LicenseService licenseService;

	@Autowired
	private CustomerPaymentService customerPaymentService;

	@Autowired
	private InstallableAppsService installableAppsService;

	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private WorkspaceService workspaceService;

	@Autowired
	private WorkflowClientService workflowClientService;

	@Autowired
	private UserService userService;

	@Autowired
	private YoroGroupService groupService;

	@Autowired
	private AccountCreationDetailsService accountCreationDetailsService;

	public Customers getCustomer(String subdomainName) {
		YorosisContext context = setYoroflowContext();
		try {
			return customerService.getCustomer(subdomainName);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public CustomersVO getCustomerInfo() throws IOException {
		YorosisContext context = setYoroflowContext();
		try {
			return customerService.getCustomerInfo(context.getTenantId());
		} finally {
			clearYoroflowContext(context);
		}
	}

	public ResponseStringVO saveCustomerPayment(CustomerPaymentVO customerPaymentVO, String tenantId)
			throws StripeException, IOException, URISyntaxException {
		UsersVO userVO = userService.getLoggedInUserDetails();
		YorosisContext context = setYoroflowContext();
		try {
			return customerPaymentService.paymentProcess(customerPaymentVO, tenantId, userVO);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public ResponseStringVO addUsersPayment(CustomerPaymentVO customerPaymentVO, String tenantId)
			throws StripeException, IOException {
		YorosisContext context = setYoroflowContext();
		try {
			return customerPaymentService.addAdditionalUsers(customerPaymentVO, tenantId);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public ResponseStringVO downgradePlan(CustomerPaymentVO customerPaymentVO, String tenantId)
			throws StripeException, IOException {
		UsersVO userVO = userService.getLoggedInUserDetails();
		YorosisContext context = setYoroflowContext();
		try {
			return customerPaymentService.downgradePlan(customerPaymentVO, tenantId, userVO);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public List<CustomerPaymentVO> getPaymentHistory(String paymentCustomerId, String tenantId) throws IOException {
		YorosisContext context = setYoroflowContext();
		try {
			return customerPaymentService.getPaymentHistory(paymentCustomerId, tenantId);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public byte[] getReceiptPdf(UUID id) throws IOException {
		YorosisContext context = setYoroflowContext();
		try {
			return customerPaymentService.getReceiptPdf(id);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public List<PlanDetailsListVo> getPaymentSubscriptionDetailsFromAnotherCustomer() {
		YorosisContext context = setYoroflowContext();
		try {
			return paymentSubscriptionDetailsService
					.getPaymentSubscriptionDetailsFromAnotherCustomer(context.getTenantId());
		} finally {
			clearYoroflowContext(context);
		}
	}

	public List<PlanDetailsListVo> getPaymentSubscriptionDetailsForPayment() {
		YorosisContext context = setYoroflowContext();
		try {
			return paymentSubscriptionDetailsService.getPaymentSubscriptionDetailsForPayment(context.getTenantId());
		} finally {
			clearYoroflowContext(context);
		}
	}

	public OrgSubscriptionVo getOrgSubscriptionByCustomer(String tenantId) throws StripeException {
		YorosisContext context = setYoroflowContext();
		log.info("context: {}", context);
		try {
			return orgSubscriptionService.getOrgSubscriptionByCustomer(tenantId);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public ResponseStringVO setFreePlan(SubscriptionExpireVO subscriptionExpireVO) throws IOException {
		groupService.inactivateTeams(subscriptionExpireVO);
		userService.inactivateUsers(subscriptionExpireVO);
		workflowClientService.inactivateTaskboards(YorosisContext.get().getToken(), subscriptionExpireVO);
		workflowClientService.inactivateWorkflows(YorosisContext.get().getToken(), subscriptionExpireVO);
		workflowClientService.inactivateDocs(YorosisContext.get().getToken(), subscriptionExpireVO);
		workspaceService.inactivateWorkpace(subscriptionExpireVO);
		YorosisContext context = setYoroflowContext();
		log.info("context: {}", context);
		try {
			return orgSubscriptionService.setFreePlan(subscriptionExpireVO);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public OrganizationDiscountVo getAmountPerUser(CustomersVO customerVo) throws StripeException {
		YorosisContext context = setYoroflowContext();
		log.info("context: {}", context);
		try {
			return customerService.getAmountPerUser(customerVo);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public List<PlanDetailsListVo> getPlanDetailsByCustomer(CustomersVO customerVo) throws StripeException {
		YorosisContext context = setYoroflowContext();
		log.info("context:{}", context);
		try {
			return customerService.getPaymentDetailsByCustomer(customerVo);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public CustomerPaymentVO getCustomerPaymentVO(String paymentCustomerId) throws StripeException {
		YorosisContext context = setYoroflowContext();
		try {
			return customerPaymentService.getPaymentCardDetails(paymentCustomerId, context.getTenantId());
		} finally {
			clearYoroflowContext(context);
		}
	}

	public LicenseVO isAllowed(String currentTenantId, String category, String featureName) {
		YorosisContext context = setYoroflowContext();
		try {
			return licenseService.isAllowed(currentTenantId, category, featureName);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public Long getTotalQuantity(String currentTenantId) throws IOException {
		YorosisContext context = setYoroflowContext();
		try {
			return licenseService.getTotalQuantity(currentTenantId);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public ResponseStringVO updateCardDetails(CustomerPaymentVO customerPaymentVO) throws StripeException, IOException {
		UsersVO userVO = userService.getLoggedInUserDetails();
		YorosisContext context = setYoroflowContext();
		try {
			return customerPaymentService.updatePaymentCardDetails(customerPaymentVO, userVO);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public List<InstallableAppsVo> getInstalledAppsList() {
		YorosisContext context = setYoroflowContext();
		try {
			return installableAppsService.getInstalledAppsList();
		} finally {
			clearYoroflowContext(context);
		}
	}

	public InstallableApps getInstallAppsById(UUID appId) {
		YorosisContext context = setYoroflowContext();
		try {
			return installableAppsService.getInstallAppsById(appId);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public List<WorkspaceVO> getAllWorkspaceList(String subdomainName) throws IOException {
		YorosisContext context = setYoroflowContext();
		Customers customer = customerService.getCustomer(subdomainName);
		if (customer != null) {
			YorosisContext
					.set(YorosisContext.builder().tenantId(customer.getTenantId()).token(context.getToken()).build());
		}

		try {
			return workspaceService.getAllWorkspaceList(customer.getTenantId());
		} finally {
			clearYoroflowContext(context);
		}
	}

	public OrgSummaryReportVo getOrgUserTeamsList(String subdomainName) throws IOException {
		YorosisContext context = setYoroflowContext();
		Customers customer = customerService.getCustomer(subdomainName);
		if (customer != null) {
			YorosisContext
					.set(YorosisContext.builder().tenantId(customer.getTenantId()).token(context.getToken()).build());
		}

		try {
			return workspaceService.getOrgUserTeamsList();
		} finally {
			clearYoroflowContext(context);
		}
	}

	public String getCustomerTimeZone(String tenantId) throws IOException {
		YorosisContext context = setYoroflowContext();
		try {
			Customers customer = customerService.getCustomerInfoByTenantId(tenantId);
			return customer != null ? customer.getTimezone() : null;
		} finally {
			clearYoroflowContext(context);
		}
	}

	public ResponseStringVO saveAccountDetails(AccountDetailsVO accountDetailsVO) {
		YorosisContext context = setYoroflowContextForAccount();
		try {
			return accountCreationDetailsService.saveAccountDetails(accountDetailsVO);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public ResponseStringVO checkAccountDetailsEmail(String emailId) {
		YorosisContext context = setYoroflowContextForAccount();
		try {
			return accountCreationDetailsService.checkAccountDetailsEmail(emailId);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public ResponseStringVO createAccountDetails(AccountDetailsVO accountDetailsVO, String remoteIp)
			throws IOException, YoroappsException, MessagingException, StripeException {
		YorosisContext context = setYoroflowContextForCreateAccount(accountDetailsVO);
		try {
			return accountCreationDetailsService.createAccount(accountDetailsVO, remoteIp);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public ResponseStringVO checkAccountDetailsToken(AccountDetailsVO accountDetailsVO)
			throws IOException, YoroappsException, MessagingException, StripeException {
		YorosisContext context = setYoroflowContextForAccount();
		try {
			return accountCreationDetailsService.checkAccountDetailsToken(accountDetailsVO);
		} finally {
			clearYoroflowContext(context);
		}
	}

	public ResponseStringVO checkSubdomain(String subDomainName)
			throws IOException, YoroappsException, MessagingException, StripeException {
		YorosisContext context = setYoroflowContextForAccount();
		try {
			return customerService.checkSubdomainNameForAccountCreation(subDomainName);
		} finally {
			clearYoroflowContext(context);
		}
	}

	private YorosisContext setYoroflowContextForCreateAccount(AccountDetailsVO accountDetailsVO) {
		YorosisContext context = YorosisContext.get();
		YorosisContext.set(YorosisContext.builder().tenantId(YorosisConstants.DEFAULT_SCHEMA)
				.userName(accountDetailsVO.getEmail()).build());
		return context;
	}

	private YorosisContext setYoroflowContextForAccount() {
		YorosisContext context = YorosisContext.get();
		YorosisContext.set(YorosisContext.builder().tenantId(YorosisConstants.DEFAULT_SCHEMA).build());
		return context;
	}

	private YorosisContext setYoroflowContext() {
		YorosisContext context = YorosisContext.get();
		YorosisContext.set(YorosisContext.builder().tenantId(YorosisConstants.DEFAULT_SCHEMA)
				.userName(context.getUserName()).rolesList(context.getRolesList()).build());
		return context;
	}

	private void clearYoroflowContext(YorosisContext oldContext) {
		YorosisContext.clear();
		YorosisContext.set(oldContext);
	}

}
