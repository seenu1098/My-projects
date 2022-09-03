package com.yorosis.yoroflow.creation.service;

import java.io.IOException;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.UUID;

import javax.mail.MessagingException;

import org.apache.commons.codec.binary.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.stripe.exception.StripeException;
import com.yorosis.yoroapps.entities.AccountCreationDetails;
import com.yorosis.yoroapps.vo.AccountDetailsVO;
import com.yorosis.yoroapps.vo.CustomersVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.repository.AccountCreationDetailsRepository;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.client.AuthnzServiceClient;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class AccountCreationDetailsService {

	@Autowired
	private AccountCreationDetailsRepository accountDetailsRepository;

	@Autowired
	private CustomerService customerService;

	@Autowired
	private PaymentSubscriptionDetailsService paymentSubscriptionDetailsService;

	@Autowired
	private UserService userService;

	@Autowired
	private WorkflowClientService workflowClientService;

	@Autowired
	private AuthnzServiceClient authnzServiceClient;

	private AccountCreationDetails constructAccountDetailsVOToDto(AccountDetailsVO accountDetailsVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return AccountCreationDetails.builder().firstName(accountDetailsVO.getFirstName())
				.activeFlag(YorosisConstants.YES).lastName(accountDetailsVO.getLastName())
				.phoneNumber(accountDetailsVO.getPhoneNumber()).email(accountDetailsVO.getEmail()).createdOn(timestamp)
				.modifiedOn(timestamp).accessToken(generateToken()).build();
	}

	private String generateToken() {
		return new Timestamp(System.currentTimeMillis()).toString() + UUID.randomUUID().toString();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO saveAccountDetails(AccountDetailsVO accountDetailsVO) {
		if (authnzServiceClient.verifyInfo(accountDetailsVO.getRecaptcha(), Long.valueOf(2))) {
			if (accountDetailsRepository.getAccountCreationDetailsByEmail(accountDetailsVO.getEmail()) == 0) {
				AccountCreationDetails accountDetails = constructAccountDetailsVOToDto(accountDetailsVO);
				accountDetails = accountDetailsRepository.save(accountDetails);
				accountDetailsVO.setAccountId(accountDetails.getId());
				accountDetailsVO.setToken(accountDetails.getAccessToken());
				workflowClientService.saveAccountDetails(accountDetailsVO);
				return ResponseStringVO.builder().response("Account details saved successfully").build();
			} else {
				return ResponseStringVO.builder().response("Email already taken").build();
			}
		} else {
			return ResponseStringVO.builder().response("Recaptcha verfication failed").build();
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO checkAccountDetailsToken(AccountDetailsVO accountDetailsVO) {
		AccountCreationDetails accountDetails = accountDetailsRepository
				.getAccountCreationDetailsByAccountId(accountDetailsVO.getToken(), YorosisConstants.YES);
		if (accountDetails != null) {
			return ResponseStringVO.builder().response(accountDetails.getEmail()).build();
		}
		return ResponseStringVO.builder().response("Invalid token").build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO checkAccountDetailsEmail(String emailId) {
		int accountDetails = accountDetailsRepository.getAccountCreationDetailsByEmail(emailId);
		if (accountDetails == 0) {
			return ResponseStringVO.builder().response("proceed").build();
		}
		return ResponseStringVO.builder().response("Email already taken").build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO createAccount(AccountDetailsVO accountDetailsVO, String remoteIp)
			throws IOException, YoroappsException, MessagingException, StripeException {
//		if (authnzServiceClient.verifyInfo(accountDetailsVO.getRecaptcha(), Long.valueOf(2))) {
			AccountCreationDetails accountDetails = accountDetailsRepository
					.getAccountCreationDetailsByAccountId(accountDetailsVO.getToken(), YorosisConstants.YES);
			if (accountDetails != null) {
				if (StringUtils.equals(customerService
						.checkSubdomainNameForAccountCreation(accountDetailsVO.getSubdomainName()).getResponse(),
						"proceed")) {
					LocalDate date = LocalDate.now();
					LocalDate endDate = date.plusWeeks(1);
					String password = String.valueOf(userService.generatePassword(8));
					CustomersVO customerVo = CustomersVO.builder().defaultLanguge("en")
							.subdomainName(accountDetailsVO.getSubdomainName())
							.actualDomainName(accountDetails.getSubdomainName()).maximumUsers(5)
							.orgName(accountDetailsVO.getCompanyName()).themeId("yoroflow-theme").serverFarm("us_farm")
							.timezone("America/Dawson").dataSourceName("us").password(password)
							.confirmPassword(password).startDate(Date.valueOf(date)).endDate(Date.valueOf(endDate))
							.subscriptionStartDate(Date.valueOf(date)).subscriptionEndDate(Date.valueOf(endDate))
							.firstName(accountDetails.getFirstName()).lastName(accountDetails.getLastName())
							.contactEmailId(accountDetails.getEmail()).userEmailId(accountDetails.getEmail())
							.orgPlanType(accountDetailsVO.getPlanType()).orgBillingType("monthly")
							.organizationDiscountList(paymentSubscriptionDetailsService
									.getOrganizationDiscountVo(YorosisContext.get().getTenantId()))
							.phoneNumber(accountDetails.getPhoneNumber()).build();
					customerService.createCustomerFromAccount(customerVo, null,
							remoteIp == null ? "localhost" : remoteIp);
					accountDetails.setCompanyName(accountDetailsVO.getCompanyName());
					accountDetails.setSubdomainName(accountDetailsVO.getSubdomainName());
					accountDetails.setModifiedOn(new Timestamp(System.currentTimeMillis()));
					accountDetails.setActiveFlag(YorosisConstants.NO);
					accountDetailsRepository.save(accountDetails);
					return ResponseStringVO.builder().response("Account created successfully").build();
				} else {
					return ResponseStringVO.builder().response("Subdomain name already taken please give another one")
							.build();
				}
			} else {
				return ResponseStringVO.builder().response("Invalid Account details").build();
			}

//		} else {
//			return ResponseStringVO.builder().response("Recaptcha verfication failed").build();
//		}
	}
	

}
