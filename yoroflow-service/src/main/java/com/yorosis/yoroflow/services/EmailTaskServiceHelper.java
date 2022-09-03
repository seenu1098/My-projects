package com.yorosis.yoroflow.services;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yorosis.yoroflow.entities.MetricsData;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.models.email.EmailFieldsVo;
import com.yorosis.yoroflow.models.email.ResolvedEmailVo;
import com.yorosis.yoroflow.repository.MetricDataRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.schedule.services.SchedulerMultiTenancyService;

@Service
public class EmailTaskServiceHelper {

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private WorkflowService workflowService;

	@Autowired
	private YoroappsServiceClient webserviceClient;

	@Autowired
	private MetricDataRepository metricDataRepository;

	@Autowired
	private SchedulerMultiTenancyService multiTenancyService;

	public void emailTaskService(ProcessInstanceTask procInstanceTask, JsonNode procDefTaskProperty, boolean remainder) throws YoroFlowException {
		try {
			EmailFieldsVo emailFields = objectMapper.treeToValue(procDefTaskProperty, EmailFieldsVo.class);
			if (Boolean.TRUE.equals(emailFields.getFieldType())) {
				getRepeatableFields(procInstanceTask, emailFields, procDefTaskProperty, remainder);
			} else {
				sentEmail(procInstanceTask, emailFields, procDefTaskProperty, remainder, false, null);
			}
		} catch (JsonProcessingException e) {
			throw new YoroFlowException(ExceptionUtils.getRootCauseMessage(e));
		}
	}

	@SuppressWarnings("deprecation")
	private void sentEmail(ProcessInstanceTask procInstanceTask, EmailFieldsVo emailFields, JsonNode procDefTaskProperty, boolean remainder, boolean isArray,
			JsonNode objNode) {
		ResolvedEmailVo resolvedEmailVo = new ResolvedEmailVo();
		resolvedEmailVo.setEmailTemplate(resolveEmailTemplate(procInstanceTask, emailFields.getEmailTemplate(), isArray, objNode));
		resolvedEmailVo.setEmailTo(resolveEmailTo(procInstanceTask, emailFields, procDefTaskProperty, isArray, objNode));
		resolvedEmailVo.setEmailBCC(resolveEmailBCC(procInstanceTask, emailFields, procDefTaskProperty, isArray, objNode));
		resolvedEmailVo.setEmailCC(resolveEmailCC(procInstanceTask, emailFields, procDefTaskProperty, isArray, objNode));
		resolvedEmailVo.setAttachFile(resolveFile(procInstanceTask, emailFields.getAttachFile()));
		ObjectNode emailSendNode = JsonNodeFactory.instance.objectNode();
		ObjectNode arrayobjectnode = objectMapper.createObjectNode();
		ArrayNode arrayNode = objectMapper.createArrayNode();
		emailSendNode.put("FirstName", "Admin");
		if (!StringUtils.isEmpty(emailFields.getEmailFrom()) && !StringUtils.isEmpty(emailFields.getSenderName())) {
			StringBuilder senderDetails = new StringBuilder();
			senderDetails.append(emailFields.getSenderName()).append(" ").append("<").append(emailFields.getEmailFrom()).append(">");
			emailSendNode.put("senderDetails", senderDetails.toString());
		}
		setArrayNode(resolvedEmailVo.getEmailTo(), arrayobjectnode, arrayNode);
		emailSendNode.put("RecipientEmails", arrayNode);
		arrayobjectnode = objectMapper.createObjectNode();
		arrayNode = objectMapper.createArrayNode();
		if (!resolvedEmailVo.getEmailBCC().isEmpty() && !CollectionUtils.isEmpty(resolvedEmailVo.getEmailBCC())) {
			setArrayNode(resolvedEmailVo.getEmailBCC(), arrayobjectnode, arrayNode);
			emailSendNode.put("EmailBCC", arrayNode);
		}
		arrayobjectnode = objectMapper.createObjectNode();
		arrayNode = objectMapper.createArrayNode();
		if (!resolvedEmailVo.getEmailCC().isEmpty() && !CollectionUtils.isEmpty(resolvedEmailVo.getEmailCC())) {
			setArrayNode(resolvedEmailVo.getEmailCC(), arrayobjectnode, arrayNode);
			emailSendNode.put("EmailCC", arrayNode);
		}
		emailSendNode.put("MessageBody", resolvedEmailVo.getEmailTemplate());
		emailSendNode.put("subject", resolveEmailTemplate(procInstanceTask, emailFields.getSubject(), isArray, objNode));
		if (!StringUtils.isEmpty(emailFields.getEmailFrom())) {
			emailSendNode.put("fromEmailId", emailFields.getEmailFrom());
		}
		if (StringUtils.isNotBlank(resolvedEmailVo.getAttachFile())) {
			emailSendNode.put("fileName", resolveExcelName(procInstanceTask, emailFields.getAttachFile(), isArray, objNode) + ".xlsx");
			emailSendNode.put("fileMimeType", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
			emailSendNode.put("file", resolvedEmailVo.getAttachFile());
		}
		emailSendNode.put("FromWorkflow", true);
		webserviceClient.sendEmail(YorosisContext.get().getToken(), emailSendNode);
		if (remainder) {
			multiTenancyService.saveTaskComments(procInstanceTask, resolvedEmailVo.getEmailTemplate());
		}
		if (!CollectionUtils.isEmpty(resolvedEmailVo.getEmailTo())) {
			for (String emailTo : resolvedEmailVo.getEmailTo()) {
				if (emailTo != null) {
					metricDataRepository.save(constructMetricsDataFromVo(procInstanceTask, emailTo));
				}
			}
		}
	}

	private String resolveExcelName(ProcessInstanceTask procInstanceTask, String excelName, boolean isArray, JsonNode objNode) {
		StringBuilder resolvedEmailTemplate = new StringBuilder();
		if (StringUtils.isNotBlank(excelName) && StringUtils.contains(excelName, "${")) {
			for (String primarySplit : StringUtils.split(excelName, '$')) {

				if (StringUtils.startsWith(primarySplit, "{")) {
					for (String secondarySplit : StringUtils.split(primarySplit, '}')) {
						if (StringUtils.startsWith(secondarySplit, "{")) {
							resolvedEmailTemplate.append(getResolvedMails(procInstanceTask,
									StringUtils.substring(secondarySplit, StringUtils.indexOf(secondarySplit, "{") + 1), isArray, objNode));
						} else {
							resolvedEmailTemplate.append(secondarySplit);
						}
					}
				} else {
					resolvedEmailTemplate.append(primarySplit);
				}
			}
			return resolvedEmailTemplate.toString();
		}
		return excelName;
	}

	private void setArrayNode(List<String> emailList, ObjectNode arrayobjectnode, ArrayNode arrayNode) {
		int i = 0;
		for (String emailTo : emailList) {
			arrayobjectnode.put("email" + i++, emailTo);
		}
		arrayNode.add(arrayobjectnode);
	}

	private void getRepeatableFields(ProcessInstanceTask procInstanceTask, EmailFieldsVo emailFields, JsonNode procDefTaskProperty, boolean remainder) {
		ValueType fieldValue = workflowService.getFieldValue(procInstanceTask.getProcessInstance().getProcessInstanceId(),
				procDefTaskProperty.get("repeatableField").asText(), VariableType.PAGEFIELD);
		JsonNode jsonFieldValue = objectMapper.convertValue(fieldValue.getValue(), JsonNode.class);
		if (jsonFieldValue.isArray()) {
			for (JsonNode objNode : jsonFieldValue) {
				sentEmail(procInstanceTask, emailFields, procDefTaskProperty, remainder, true, objNode);
			}
		}
	}

	private String getArrayValues(String fieldId, JsonNode objNode) {
		if (objNode.has(fieldId)) {
			return objNode.get(fieldId).asText();
		}
		return null;
	}

	private String getResolvedMails(ProcessInstanceTask procInstanceTask, String fieldId, boolean isArray, JsonNode objNode) {
		if (isArray) {
			String email = getArrayValues(fieldId, objNode);
			if (!StringUtils.isEmpty(email)) {
				return email;
			} else {
				ValueType valueType = workflowService.getFieldValue(procInstanceTask.getProcessInstance().getProcessInstanceId(), fieldId,
						VariableType.PAGEFIELD);
				if (valueType.getValue() != null && !StringUtils.equals(valueType.getValue().toString(), "null")) {
					return ((valueType.getValue().toString()));
				}
			}
		} else {
			ValueType valueType = workflowService.getFieldValue(procInstanceTask.getProcessInstance().getProcessInstanceId(), fieldId, VariableType.PAGEFIELD);
			if (valueType.getValue() != null && !StringUtils.equals(valueType.getValue().toString(), "null")) {
				return ((valueType.getValue().toString()));
			}
		}
		return null;
	}

	private List<String> resolveEmailTo(ProcessInstanceTask procInstanceTask, EmailFieldsVo emailToList, JsonNode procDefTaskProperty, boolean isArray,
			JsonNode objNode) {
		List<String> resolvedEmailTo = new ArrayList<String>();
		if (procDefTaskProperty.has("emailToPageFields") && procDefTaskProperty.get("emailToPageFields").isArray()) {
			List<JsonNode> emailToPageFieldsArray = procDefTaskProperty.findValues("emailToPageFields");
			for (JsonNode emailToPageFieldArray : emailToPageFieldsArray) {
				for (JsonNode emailToPageField : emailToPageFieldArray) {
					resolvedEmailTo.add(getResolvedMails(procInstanceTask, emailToPageField.asText(), isArray, objNode));
				}
			}
		}
		if (!CollectionUtils.isEmpty(emailToList.getEmailTo())) {
			resolvedEmailTo.addAll(emailToList.getEmailTo());
		}
		return resolvedEmailTo;
	}

	private List<String> resolveEmailBCC(ProcessInstanceTask procInstanceTask, EmailFieldsVo emailBCCList, JsonNode procDefTaskProperty, boolean isArray,
			JsonNode objNode) {
		List<String> resolvedEmailBCC = new ArrayList<String>();
		if (procDefTaskProperty.has("emailBCCPageFields") && procDefTaskProperty.get("emailBCCPageFields").isArray()) {
			List<JsonNode> emailBCCPageFieldsArray = procDefTaskProperty.findValues("emailBCCPageFields");
			for (JsonNode emailBCCPageFieldArray : emailBCCPageFieldsArray) {
				for (JsonNode emailBCCPageField : emailBCCPageFieldArray) {
					resolvedEmailBCC.add(getResolvedMails(procInstanceTask, emailBCCPageField.asText(), isArray, objNode));
				}
			}
		}
		if (!CollectionUtils.isEmpty(emailBCCList.getEmailBCC()) && BooleanUtils.isTrue(emailBCCList.getBcc())) {
			resolvedEmailBCC.addAll(emailBCCList.getEmailBCC());
		}
		return resolvedEmailBCC;
	}

	private List<String> resolveEmailCC(ProcessInstanceTask procInstanceTask, EmailFieldsVo emailCCList, JsonNode procDefTaskProperty, boolean isArray,
			JsonNode objNode) {
		List<String> resolvedEmailCC = new ArrayList<String>();
		if (procDefTaskProperty.has("emailCCPageFields") && procDefTaskProperty.get("emailCCPageFields").isArray()) {
			List<JsonNode> emailCCPageFieldsArray = procDefTaskProperty.findValues("emailCCPageFields");
			for (JsonNode emailCCPageFieldArray : emailCCPageFieldsArray) {
				for (JsonNode emailCCPageField : emailCCPageFieldArray) {
					resolvedEmailCC.add(getResolvedMails(procInstanceTask, emailCCPageField.asText(), isArray, objNode));
				}
			}
		}
		if (!CollectionUtils.isEmpty(emailCCList.getEmailCC()) && BooleanUtils.isTrue(emailCCList.getCc())) {
			resolvedEmailCC.addAll(emailCCList.getEmailCC());
		}
		return resolvedEmailCC;
	}

	private String resolveEmailTemplate(ProcessInstanceTask procInstanceTask, String emailTemplate, boolean isArray, JsonNode objNode) {
		StringBuilder resolvedEmailTemplate = new StringBuilder();
		if (StringUtils.isNotBlank(emailTemplate) && StringUtils.contains(emailTemplate, "${")) {
			for (String primarySplit : StringUtils.split(emailTemplate, '$')) {

				if (StringUtils.startsWith(primarySplit, "{")) {
					for (String secondarySplit : StringUtils.split(primarySplit, '}')) {
						if (StringUtils.startsWith(secondarySplit, "{")) {
							String resolvedMails = getResolvedMails(procInstanceTask,
									StringUtils.substring(secondarySplit, StringUtils.indexOf(secondarySplit, "{") + 1), isArray, objNode);
							if (resolvedMails != null) {
								resolvedEmailTemplate.append(resolvedMails);
							}
						} else {
							resolvedEmailTemplate.append(secondarySplit);
						}
					}
				} else {
					resolvedEmailTemplate.append(primarySplit);
				}
			}
			return resolvedEmailTemplate.toString();
		}
		return emailTemplate;
	}

	private String resolveFile(ProcessInstanceTask procInstanceTask, String fileName) {
		if (StringUtils.isNotBlank(fileName)) {
			ValueType valueType = workflowService.getFieldValue(procInstanceTask.getProcessInstance().getProcessInstanceId(), fileName, VariableType.PAGEFIELD);
			return valueType.getValue().toString();
		}
		return null;
	}

	private MetricsData constructMetricsDataFromVo(ProcessInstanceTask procInstanceTask, String emailTo) {
//		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return MetricsData.builder().metricType("email").recipientId(emailTo).taskId(procInstanceTask.getProcessInstanceTaskId())
				.createdBy(YorosisContext.get().getUserName()).tenantId(YorosisContext.get().getTenantId()).build();
	}

}
