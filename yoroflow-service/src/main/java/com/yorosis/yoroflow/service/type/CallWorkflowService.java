package com.yorosis.yoroflow.service.type;

import java.text.ParseException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.apache.commons.lang3.exception.ExceptionUtils;
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
import com.yorosis.yoroflow.models.CallWorkflowFields;
import com.yorosis.yoroflow.models.CallWorkflowVO;
import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.models.TaskDetailsResponse;
import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.services.ValueType;
import com.yorosis.yoroflow.services.WorkflowService;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class CallWorkflowService extends AbstractBaseTypeService implements TaskService {

	@Override
	public TaskType getTaskType() {
		return TaskType.CALL_ANOTHER_WORKFLOW;
	}

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private WorkflowService workflowService;

	private static final String MAIN_SECTION = "mainSection";

	@Override
	public Map<String, List<FieldVO>> getFieldList(JsonNode taskProperty) {
		Map<String, List<FieldVO>> fieldList = new LinkedHashMap<>();
		if (taskProperty != null && taskProperty.get("processDefinitionId") != null && taskProperty.get("alias") != null) {
			UUID processDefinitionId = UUID.fromString(taskProperty.get("processDefinitionId").asText());
			String alias = (taskProperty.get("alias").asText());
			try {
				fieldList.put(MAIN_SECTION, workflowService.getPageFieldsForWorkflow(processDefinitionId, alias));
			} catch (JsonProcessingException | YoroFlowException e) {
				log.error("Error occurred in CallAnotherWorkflow ", e);
			}
		}
		return fieldList;

	}

	@Override
	public ProcessInstanceTask preProcessTask(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask) throws YoroFlowException {

		List<ProcessDefTaskProperty> listTaskProperties = procDefinitionTask.getTaskProperties();
		if (!CollectionUtils.isEmpty(listTaskProperties)) {
			ProcessDefTaskProperty procDefTaskProperty = listTaskProperties.get(0);

			try {
				CallWorkflowVO callWorkflowVO = objectMapper.treeToValue(procDefTaskProperty.getPropertyValue(), CallWorkflowVO.class);
				if (callWorkflowVO != null) {
					ObjectNode webHookPayload = JsonNodeFactory.instance.objectNode();
					if (!CollectionUtils.isEmpty(callWorkflowVO.getCallAnotherWorkflowFields())) {
						for (CallWorkflowFields callWorkflowFields : callWorkflowVO.getCallAnotherWorkflowFields()) {
							ValueType valueType = workflowService.getFieldValue(procInstanceTask.getProcessInstance().getProcessInstanceId(),
									callWorkflowFields.getFieldValue(), callWorkflowFields.getVariableType());
							webHookPayload.put(callWorkflowFields.getFieldName(), valueType.getValue().toString());

						}
					}

					TaskDetailsResponse taskDetailResponse = workflowService.startProcess(callWorkflowVO.getWorkflowKey(), callWorkflowVO.getWorkflowVersion(),
							webHookPayload, procInstanceTask.getProcessInstanceTaskId(), procInstanceTask.getProcessDefinitionTask().getProcessDefinition().getWorkspaceId());
					procInstanceTask.setInitiatedProcessInstanceAlias(callWorkflowVO.getAlias());
					procInstanceTask.setInitiatedProcessInstanceID(taskDetailResponse.getInstanceId());
				}
			} catch (JsonProcessingException | ParseException e) {
				throw new YoroFlowException(ExceptionUtils.getRootCauseMessage(e));
			}
		}
		return procInstanceTask;

	}

	@Override
	public boolean canProceed(ProcessInstanceTask procInstanceTask) {

		return false;
	}

	@Override
	public boolean processTypeSpecificService(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask)
			throws YoroFlowException, ParseException {
		procInstanceTask.setTargetStepKey(procDefinitionTask.getTargetStepKey());

		return true;
	}

}
