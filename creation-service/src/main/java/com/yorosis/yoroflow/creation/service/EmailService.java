package com.yorosis.yoroflow.creation.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.activation.DataSource;
import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import javax.mail.util.ByteArrayDataSource;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.entities.EmailTemplate;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.repository.CustomersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {

	@Autowired
	private FileManagerService fileManagerService;

	@Autowired
	private JavaMailSender emailSender;

	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private EmailTemplateService emailTemplateService;

	@Transactional
	public ResponseStringVO sendmail(JsonNode emailJson) throws MessagingException, YoroappsException, IOException {
		return inviteOrDeactivetUser(emailJson);
	}

	public ResponseStringVO inviteOrDeactivetUser(JsonNode emailProperty) throws MessagingException, YoroappsException, IOException {
		log.info("Sending email: {}", emailProperty);
		String text = null;
		String subject = null;
		String recipientsEmail = null;
		String emailBCC = null;
		String emailCC = null;
		byte[] byteArray = null;
		List<String> arrList = new ArrayList<>();
		List<String> emailListBCC = new ArrayList<>();
		List<String> emailListCC = new ArrayList<>();
		if (emailProperty.has("FromWorkflow") && emailProperty.get("FromWorkflow").asBoolean()) {
			text = emailProperty.get("MessageBody").asText();
			log.info("Sending the email text as received: {}", text);
			if (emailProperty.has("file")) {
				byteArray = fileManagerService.downloadFile(emailProperty.get("file").asText());
			}
		} else {
			log.info("Resolving the template");
			text = getResolvedTemplate(emailProperty);
		}
		if (StringUtils.isEmpty(text)) {
			log.warn("No text found.  Returning without sending email");
			return ResponseStringVO.builder().response("Message is empty").build();
		} else {
			String userName = emailProperty.get("FirstName").asText();
			if (emailProperty.get("RecipientEmails").isArray()) {
				saveEmailList(emailProperty, arrList, "RecipientEmails");
			} else {
				recipientsEmail = emailProperty.get("RecipientEmails").asText();
			}

			subject = emailProperty.get("subject").asText();
			MimeMessage msg = emailSender.createMimeMessage();
			if (emailProperty.has("senderDetails")) {
				msg.addHeader("Sender", emailProperty.get("senderDetails").asText());
			}
			MimeMessageHelper message = new MimeMessageHelper(msg, true);
			message.setFrom(userName + "<yoroflowbot@yoroflow.com>");
			if (!arrList.isEmpty()) {
				String[] arr = new String[arrList.size()];
				for (int i = 0; i < arrList.size(); i++) {
					if (!arrList.get(i).contains("null")) {
						arr[i] = arrList.get(i);
					}
					log.info("Sending the email to: {} - {}", (i + 1), arr[i]);
				}
				message.setTo(arr);
			} else {
				message.setTo(recipientsEmail);
				log.info("Sending the email to: {}", recipientsEmail);
			}
			if (emailProperty.has("EmailBCC")) {
				if (emailProperty.get("EmailBCC").isArray()) {
					saveEmailList(emailProperty, emailListBCC, "EmailBCC");
					String[] arr = new String[emailListBCC.size()];
					for (int i = 0; i < emailListBCC.size(); i++) {
						if (!emailListBCC.get(i).contains("null")) {
							arr[i] = emailListBCC.get(i);
						}
						log.info("Sending the bcc email to: {} - {}", (i + 1), arr[i]);
					}
					message.setBcc(arr);
				} else {
					emailBCC = emailProperty.get("EmailBCC").asText();
					message.setBcc(emailBCC);
				}
			}
			if (emailProperty.has("EmailCC")) {
				if (emailProperty.get("EmailCC").isArray()) {
					saveEmailList(emailProperty, emailListCC, "EmailCC");
					String[] arr = new String[emailListCC.size()];
					for (int i = 0; i < emailListCC.size(); i++) {
						if (!emailListCC.get(i).contains("null")) {
							arr[i] = emailListCC.get(i);
						}
						log.info("Sending the cc email to: {} - {}", (i + 1), arr[i]);
					}
					message.setCc(arr);
				} else {
					emailCC = emailProperty.get("EmailCC").asText();
					message.setCc(emailCC);
				}
			}

			log.info("Setting the subject as: {}", subject);
			message.setSubject(subject);
			message.setText(text, true);
			if (byteArray != null) {
				DataSource source = new ByteArrayDataSource(byteArray, emailProperty.get("fileMimeType").asText());
				message.addAttachment(emailProperty.get("fileName").asText(), source);
			}

			log.info("Setting the text as: {}", text);
			emailSender.send(msg);

			log.info("Email sent successfully");
			return ResponseStringVO.builder().response("message sent successfully").build();
		}
	}

	private void saveEmailList(JsonNode emailProperty, List<String> arrList, String emailType) {
		List<JsonNode> emailLists = emailProperty.findValues(emailType);
		for (JsonNode emailList : emailLists) {
			for (JsonNode email : emailList) {
				Iterator<String> fieldNames = email.fieldNames();

				while (fieldNames.hasNext()) {
					String fieldName = fieldNames.next();
					String actualEmail = email.get(fieldName).asText();
					if (!actualEmail.contains("null") && !arrList.contains(actualEmail)) {
						arrList.add(email.get(fieldName).asText());
					}
				}
			}
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public Customers getCustomer(String tenantId) {
		return customersRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(tenantId, YoroappsConstants.YES);
	}

	private String getResolvedTemplate(JsonNode emailProperty) throws IOException {
		StringBuilder resolvedEmailTemplate = new StringBuilder();
		if (emailProperty.has("templateId")) {
			YorosisContext currentContext = YorosisContext.get();
			if (!StringUtils.equalsIgnoreCase(YorosisContext.get().getTenantId(), "yoroflow")
					&& StringUtils.equalsIgnoreCase(emailProperty.get("templateId").asText(), "inviteFirstUser")) {
				YorosisContext.clear();
				YorosisContext context = YorosisContext.builder().tenantId(YoroappsConstants.DEFAULT_SCHEMA).build();
				YorosisContext.set(context);
			}
			try {
				EmailTemplate emailTemplate = emailTemplateService.getResolvedTemplate(emailProperty);
				if (emailTemplate != null) {
					String nonResolvedEmailTemplate = emailTemplate.getTemplateData();
					for (String primarySplit : StringUtils.split(nonResolvedEmailTemplate, '{')) {
						if (StringUtils.contains(primarySplit, "}}")) {
							for (String secondarySplit : StringUtils.split(primarySplit, '}')) {
								if (StringUtils.isNotEmpty(secondarySplit)) {
									appendData(resolvedEmailTemplate, secondarySplit, emailProperty);
								}
							}
						} else {
							resolvedEmailTemplate.append(primarySplit);
						}
					}
				}
			} finally {
				YorosisContext.clear();
				YorosisContext.set(currentContext);
			}
		}
		return resolvedEmailTemplate.toString();
	}

	private void appendData(StringBuilder resolvedEmailTemplate, String secondarySplit, JsonNode emailProperty) throws IOException {
		if (emailProperty.has(secondarySplit)) {
			resolvedEmailTemplate.append(emailProperty.get(secondarySplit).asText());
		} else {
			resolvedEmailTemplate.append(secondarySplit);
		}
	}

}