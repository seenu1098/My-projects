package com.yorosis.yoroflow.service.type;

import java.text.ParseException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yorosis.yoroflow.entities.ProcessDefTaskProperty;
import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.models.ws.CustomHeader;
import com.yorosis.yoroflow.models.ws.HeaderKeyValue;
import com.yorosis.yoroflow.models.ws.RequestPayload;
import com.yorosis.yoroflow.models.ws.WebServiceRequest;
import com.yorosis.yoroflow.models.ws.WsRequest;
import com.yorosis.yoroflow.models.ws.WsResponse;
import com.yorosis.yoroflow.services.ValueType;
import com.yorosis.yoroflow.services.WorkflowService;
import com.yorosis.yoroflow.services.WorkflowUtils;
import com.yorosis.yoroflow.services.ws.WebServiceCaller;

@Component
public class WebserviceTaskType extends AbstractBaseTypeService implements TaskService {

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private WebServiceCaller webServiceCaller;

	@Autowired
	private WorkflowService workflowService;

	private static final String MAIN_SECTION = "mainSection";

	@Override
	public TaskType getTaskType() {
		return TaskType.WEB_SERVICE_TASK;
	}

	@Override
	public boolean canProceed(ProcessInstanceTask procInstanceTask) {
		return true;
	}

	@Override
	public Map<String, List<FieldVO>> getFieldList(JsonNode taskProperty) {
		Map<String, List<FieldVO>> fieldList = new LinkedHashMap<>();
		fieldList.put(MAIN_SECTION, WorkflowUtils.getValueFromData(taskProperty));
		return fieldList;
	}

	@Override
	public boolean processTypeSpecificService(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask)
			throws YoroFlowException, ParseException {

		List<ProcessDefTaskProperty> listTaskProperties = procDefinitionTask.getTaskProperties();

		if (!CollectionUtils.isEmpty(listTaskProperties)) {
			ProcessDefTaskProperty procDefTaskProperty = listTaskProperties.get(0);

			try {
				WebServiceRequest webServiceRequest = objectMapper.treeToValue(procDefTaskProperty.getPropertyValue(), WebServiceRequest.class);

				resolveCustomHeaders(procInstanceTask, webServiceRequest);
				resolveRequestPayload(procInstanceTask, webServiceRequest);
				resolveQueryParams(procInstanceTask, webServiceRequest);
				resolveBearerToken(procInstanceTask, webServiceRequest);
				WsRequest wsRequest = new WsRequest();
				BeanUtils.copyProperties(webServiceRequest, wsRequest);
				wsRequest.setPayload(getPayLoad(webServiceRequest.getWebServiceRequestPayload()));
				WsResponse wsresponse = webServiceCaller.processWsRequest(wsRequest);
				if (wsresponse.getBody().isArray()) {
					if (wsresponse.getBody().getArray().getJSONObject(0) != null)
						wsresponse.getBody().getArray().getJSONObject(0).append("status", wsresponse.getStatusCode()).append("statusText",
								wsresponse.getStatusText());
				} else {
					wsresponse.getBody().getObject().append("status", wsresponse.getStatusCode()).append("statusText", wsresponse.getStatusText());
				}
				procInstanceTask.setData(objectMapper.readTree(wsresponse.getBody().toPrettyString()));
				procInstanceTask.setTargetStepKey(procDefinitionTask.getTargetStepKey());
			} catch (JsonProcessingException e) {

				throw new YoroFlowException(ExceptionUtils.getRootCauseMessage(e));
			}
		}

		return true;

	}

	private JsonNode getPayLoad(List<RequestPayload> webServiceRequestPayload) {
		ObjectNode node = JsonNodeFactory.instance.objectNode();
		if (webServiceRequestPayload != null) {
			for (RequestPayload requestPayload : webServiceRequestPayload) {
				node.put(requestPayload.getKey(), requestPayload.getValue());
			}
		}
		return node;
	}

	private void resolveRequestPayload(ProcessInstanceTask procInstanceTask, WebServiceRequest webServiceRequest) {
		if (!CollectionUtils.isEmpty(webServiceRequest.getWebServiceRequestPayload())) {
			for (RequestPayload requestPayload : webServiceRequest.getWebServiceRequestPayload()) {
				ValueType valueType = workflowService.getFieldValue(procInstanceTask.getProcessInstance().getProcessInstanceId(), requestPayload.getValue(),
						requestPayload.getVariableType());
				requestPayload.setValue(valueType.getValue().toString());
			}

		}
	}

	private void resolveCustomHeaders(ProcessInstanceTask procInstanceTask, WebServiceRequest webServiceRequest) {
		if (!CollectionUtils.isEmpty(webServiceRequest.getCustomHeaders())) {
			for (CustomHeader customHeader : webServiceRequest.getCustomHeaders()) {
				ValueType valueType = workflowService.getFieldValue(procInstanceTask.getProcessInstance().getProcessInstanceId(), customHeader.getValue(),
						customHeader.getVariableType());
				customHeader.setValue(valueType.getValue().toString());
			}

		}
	}

	private void resolveQueryParams(ProcessInstanceTask procInstanceTask, WebServiceRequest webServiceRequest) {
		if (!CollectionUtils.isEmpty(webServiceRequest.getQueryParams())) {
			for (HeaderKeyValue headerKeyValue : webServiceRequest.getQueryParams()) {
				ValueType valueType = workflowService.getFieldValue(procInstanceTask.getProcessInstance().getProcessInstanceId(), headerKeyValue.getValue(),
						headerKeyValue.getVariableType());
				headerKeyValue.setValue(valueType.getValue().toString());
			}

		}
	}

	private void resolveBearerToken(ProcessInstanceTask procInstanceTask, WebServiceRequest webServiceRequest) {
		if (StringUtils.equals(webServiceRequest.getAuthorization(), "bearerToken") && StringUtils.isNotBlank(webServiceRequest.getBearerToken().getToken())) {
			ValueType valueType = workflowService.getFieldValue(procInstanceTask.getProcessInstance().getProcessInstanceId(),
					webServiceRequest.getBearerToken().getToken(), webServiceRequest.getBearerToken().getVariableType());
			webServiceRequest.getBearerToken().setToken(valueType.getValue().toString());
		}
	}

}
