package com.yorosis.yoroflow.creation.service;

import java.sql.Timestamp;
import java.util.UUID;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.yorosis.yoroapps.entities.EmailTemplate;
import com.yorosis.yoroapps.vo.EmailTemplateVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.EmailTemplateRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class EmailTemplateService {
	
	public static final PolicyFactory IMAGES = new HtmlPolicyBuilder().allowAttributes("src").onElements("img")
			.allowUrlProtocols("http", "https", "data").allowElements("img").toFactory();

	@Autowired
	private EmailTemplateRepository emailTemplateRepository;

	private EmailTemplate constructVOToDTO(EmailTemplateVO emailTemplateVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return EmailTemplate.builder().activeFlag(YoroappsConstants.YES).tenantId(YorosisContext.get().getTenantId())
				.templateId(emailTemplateVO.getEmailTemplateId()).templateName(emailTemplateVO.getEmailTemplateName())
				.templateData(emailTemplateVO.getEmailTemplateData())
				.templateSubject(emailTemplateVO.getEmailTemplateSubject())
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.createdBy(YorosisContext.get().getUserName()).createdDate(timestamp).managedFlag(YoroappsConstants.NO)
				.build();
	}

	private EmailTemplateVO constructDTOToVO(EmailTemplate emailTemplate) {
		return EmailTemplateVO.builder().id(emailTemplate.getId()).emailTemplateId(emailTemplate.getTemplateId())
				.emailTemplateName(emailTemplate.getTemplateName()).emailTemplateData(emailTemplate.getTemplateData())
				.emailTemplateSubject(emailTemplate.getTemplateSubject()).build();
	}

	@Transactional
	public ResponseStringVO save(EmailTemplateVO emailTemplateVO) {
		PolicyFactory policy = Sanitizers.FORMATTING.and(Sanitizers.LINKS).and(Sanitizers.BLOCKS).and(IMAGES)
				.and(Sanitizers.STYLES).and(Sanitizers.TABLES).and(Sanitizers.FORMATTING);
		String safeHTML = policy.sanitize(emailTemplateVO.getEmailTemplateData());
		emailTemplateVO.setEmailTemplateData(safeHTML);
		if (emailTemplateVO.getId() == null) {
			emailTemplateRepository.save(constructVOToDTO(emailTemplateVO));
			return ResponseStringVO.builder().response("Email Tempalte created successfully").build();
		} else {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			EmailTemplate emailTemplate = emailTemplateRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
					emailTemplateVO.getId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);

			emailTemplate.setTemplateId(emailTemplateVO.getEmailTemplateId());
			emailTemplate.setTemplateName(emailTemplateVO.getEmailTemplateName());
			emailTemplate.setTemplateData(emailTemplateVO.getEmailTemplateData());
			emailTemplate.setTemplateSubject(emailTemplateVO.getEmailTemplateSubject());
			emailTemplate.setModifiedBy(YorosisContext.get().getUserName());
			emailTemplate.setModifiedOn(timestamp);
			emailTemplateRepository.save(emailTemplate);

			return ResponseStringVO.builder().response("Email Tempalte updated successfully").build();
		}
	}

	@Transactional
	public EmailTemplateVO getTemplateDetails(UUID id) {
		EmailTemplate emailTemplate = emailTemplateRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(id,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		if (emailTemplate != null) {
			return constructDTOToVO(emailTemplate);
		}
		return null;
	}

	@Transactional
	public ResponseStringVO checkTemplateId(String templateId) {
		String message = null;
		int findByPageName = emailTemplateRepository.findByTemplateIdAndTenantId(templateId, YoroappsConstants.YES,
				YorosisContext.get().getTenantId());

		if (findByPageName > 0) {
			message = String.format("Email Template [%s] already exist", templateId);
		} else {
			message = String.format("Email Template [%s] does not exist", templateId);
		}
		return ResponseStringVO.builder().response(message).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public EmailTemplate getResolvedTemplate(JsonNode emailProperty) {
		return emailTemplateRepository.getEmailTemplate(emailProperty.get("templateId").asText(),
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
	}

}
