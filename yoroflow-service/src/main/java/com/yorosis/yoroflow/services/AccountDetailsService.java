package com.yorosis.yoroflow.services;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.automation.Email;
import com.yorosis.yoroapps.automation.EmailPerson;
import com.yorosis.yoroapps.vo.AccountDetailsVO;
import com.yorosis.yoroflow.entities.AccountDetails;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.repository.AccountDetailsRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class AccountDetailsService {

	@Autowired(required = false)
	private QueueService queueService;

	private static final String EMAIL = "sales@yoroflow.com";

	public ResponseStringVO handleAccountCreationEmail(AccountDetailsVO accountDetailsVO) {
//		YorosisContext.set(YorosisContext.builder().tenantId(YorosisConstants.DEFAULT_SCHEMA).build());
		Map<String, String> templateMap = new HashMap<>();
		templateMap.put("firstName", accountDetailsVO.getFirstName());
		templateMap.put("lastName", accountDetailsVO.getLastName());
		templateMap.put("accountDetailsId", accountDetailsVO.getToken());
		Set<EmailPerson> setEmailPerson = new HashSet<>();
		setEmailPerson.add(EmailPerson.builder().emailId(accountDetailsVO.getEmail()).build());
		queueService.publishToEmail(createEmail(setEmailPerson, templateMap, "accountCreation"));
		handleAccountCreationForOrganization(accountDetailsVO);
		return ResponseStringVO.builder().response("Mail send").build();
	}

	private Email createEmail(Set<EmailPerson> setEmailPerson, Map<String, String> templateMap, String templateBodyId) {
		return Email.builder().tenantId(YorosisConstants.DEFAULT_SCHEMA).isHTML(true).templateBodyId(templateBodyId)
				.templateValues(templateMap).toRecipientList(setEmailPerson).build();
	}

	public ResponseStringVO handleAccountCreationForOrganization(AccountDetailsVO accountDetailsVO) {
//		YorosisContext.set(YorosisContext.builder().tenantId(YorosisConstants.DEFAULT_SCHEMA).build());
		Map<String, String> templateMap = new HashMap<>();
		templateMap.put("firstName", accountDetailsVO.getFirstName());
		templateMap.put("lastName", accountDetailsVO.getLastName());
		templateMap.put("email", accountDetailsVO.getEmail());
		templateMap.put("phoneNumber", accountDetailsVO.getPhoneNumber());
		Set<EmailPerson> setEmailPerson = new HashSet<>();
		setEmailPerson.add(EmailPerson.builder().emailId(EMAIL).build());
		queueService.publishToEmail(createEmail(setEmailPerson, templateMap, "signupTemplate"));
		return ResponseStringVO.builder().response("Mail send").build();
	}
}
