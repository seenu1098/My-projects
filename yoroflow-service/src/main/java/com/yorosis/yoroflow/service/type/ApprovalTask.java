package com.yorosis.yoroflow.service.type;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroflow.entities.ProcessDefTaskProperty;
import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.models.decision.ApprovalModel;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.services.VariableType;
import com.yorosis.yoroflow.services.WorkflowActivityLogService;
import com.yorosis.yoroflow.services.WorkflowService;
import com.yorosis.yoroflow.services.YoroappsServiceClient;

@Service
public class ApprovalTask extends AbstractBaseTypeService implements TaskService {

	private static final String APPROVAL_STATUS = "approvalStatus";
	private static final String APPROVED = "approved";
	private static final String REJECTED = "rejected";
	private static final String SENDBACK = "sendback";

	@Override
	public TaskType getTaskType() {
		return TaskType.APPROVAL_TASK;
	}

	@Override
	public boolean canProceed(ProcessInstanceTask procInstanceTask) {
		return false;
	}

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private WorkflowService workflowService;

	@Autowired
	private YoroappsServiceClient yoroappsServiceClient;
	
	@Autowired
	private WorkflowActivityLogService workflowActivityLogService;

	private static final String MAIN_SECTION = "mainSection";
	private static final String TABLE_CONTROL = "tableControl";
	private static final String SUB_SECTION = "subSection";

	public Map<String, List<FieldVO>> getFieldList(JsonNode taskProperty) {
		List<FieldVO> listFieldVO = new ArrayList<>();
		List<FieldVO> listFieldSubVO = new ArrayList<>();
		List<FieldVO> listFieldTableVO = new ArrayList<>();
		Map<String, List<FieldVO>> fieldList = new LinkedHashMap<>();
		if (taskProperty.has("formIdentifier") && taskProperty.has("formVersion")) {
			Map<String, List<FieldVO>> fieldVolist = yoroappsServiceClient.getFieldValues(YorosisContext.get().getToken(),
					taskProperty.get("formIdentifier").asText(), taskProperty.get("formVersion").asLong());
			if (fieldVolist.get(MAIN_SECTION) != null) {
				listFieldVO.addAll(fieldVolist.get(MAIN_SECTION));
			}
			if (fieldVolist.get(TABLE_CONTROL) != null) {
//				listFieldTableVO.addAll(fieldVolist.get(TABLE_CONTROL));
				List<String> tableNameList = new ArrayList<>();
				String name = null;
				for (FieldVO field : fieldVolist.get(TABLE_CONTROL)) {
					if (!tableNameList.contains(field.getRepeatableFieldId())) {
						listFieldVO.add(FieldVO.builder().fieldId(field.getRepeatableFieldId())
								.fieldName(field.getRepeatableFieldName()).datatype("array").build());
						tableNameList.add(field.getRepeatableFieldId());
						name = field.getRepeatableFieldName();
					}
					field.setFieldName(field.getFieldName() + " (" + name + ")");
					listFieldTableVO.add(field);
				}
			}
			if (fieldVolist.get(SUB_SECTION) != null) {
				listFieldSubVO.addAll(fieldVolist.get(SUB_SECTION));
			}
		}
		fieldList.put(MAIN_SECTION, listFieldVO);
		fieldList.put(TABLE_CONTROL, listFieldTableVO);
		fieldList.put(SUB_SECTION, listFieldSubVO);
		return fieldList;
	}

	@Override
	public boolean processTypeSpecificService(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask) throws YoroFlowException {
		List<ProcessDefTaskProperty> listTaskProperties = procDefinitionTask.getTaskProperties();

		if (!CollectionUtils.isEmpty(listTaskProperties)) {
			ProcessDefTaskProperty procDefTaskProperty = listTaskProperties.get(0);
			try {
				ApprovalModel approvalModel = objectMapper.treeToValue(procDefTaskProperty.getPropertyValue(), ApprovalModel.class);
				String approvalStatus = workflowService
						.getFieldValue(procInstanceTask.getProcessInstance().getProcessInstanceId(), APPROVAL_STATUS, VariableType.PAGEFIELD).getValue()
						.toString();

				String nextTask = null;
				if (StringUtils.equalsIgnoreCase(approvalStatus, APPROVED)) {
					nextTask = approvalModel.getApprovalTask();
					workflowActivityLogService.saveActionsActivityLogForSave(procInstanceTask, "approved");
				} else if (StringUtils.equalsIgnoreCase(approvalStatus, REJECTED)) {
					nextTask = approvalModel.getRejectedTask();
					workflowActivityLogService.saveActionsActivityLogForSave(procInstanceTask, "reject");
				} else if (StringUtils.equalsIgnoreCase(approvalStatus, SENDBACK)) {
					nextTask = approvalModel.getSendBackTask();
					workflowActivityLogService.saveActionsActivityLogForSave(procInstanceTask, "sendback");
				} else {
					throw new YoroFlowException("Unsupported approval Status -" + approvalStatus);
				}

				if (StringUtils.isBlank(nextTask)) {
					throw new YoroFlowException("Next task cannot be null");
				}
				procInstanceTask.setTargetStepKey(nextTask);

			} catch (JsonProcessingException e) {
				throw new YoroFlowException(ExceptionUtils.getRootCauseMessage(e));
			}
		}
		return true;
	}
}
