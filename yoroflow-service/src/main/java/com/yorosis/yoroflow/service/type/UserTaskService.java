package com.yorosis.yoroflow.service.type;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.services.WorkflowActivityLogService;
import com.yorosis.yoroflow.services.YoroappsServiceClient;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserTaskService extends AbstractBaseTypeService implements TaskService {
	private static final String TOKEN_PREFIX = "Bearer ";

	@Autowired
	private YoroappsServiceClient yoroappsServiceClient;

	@Autowired
	private WorkflowActivityLogService workflowActivityLogService;

	private static final String MAIN_SECTION = "mainSection";
	private static final String TABLE_CONTROL = "tableControl";
	private static final String SUB_SECTION = "subSection";

	@Override
	public TaskType getTaskType() {
		return TaskType.USER_TASK;
	}

	@Override
	public boolean canProceed(ProcessInstanceTask procInstanceTask) {
		return false;
	}

	public Map<String, List<FieldVO>> getFieldList(JsonNode taskProperty) {
		List<FieldVO> listFieldVO = new ArrayList<>();
		List<FieldVO> listFieldSubVO = new ArrayList<>();
		List<FieldVO> listFieldTableVO = new ArrayList<>();
		Map<String, List<FieldVO>> fieldList = new LinkedHashMap<>();
		if (taskProperty.has("formIdentifier") && taskProperty.has("formVersion")) {
			Map<String, List<FieldVO>> fieldVolist = yoroappsServiceClient.getFieldValues(
					YorosisContext.get().getToken(), taskProperty.get("formIdentifier").asText(),
					taskProperty.get("formVersion").asLong());
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
	public boolean processTypeSpecificService(ProcessInstanceTask procInstanceTask,
			ProcessDefinitionTask procDefinitionTask) throws YoroFlowException {
		procInstanceTask.setTargetStepKey(procDefinitionTask.getTargetStepKey());
		try {
			workflowActivityLogService.saveActionsActivityLogForSave(procInstanceTask, "submitTask");
		} catch (JsonProcessingException e) {
			throw new YoroFlowException(ExceptionUtils.getRootCauseMessage(e));
		}
		return true;
	}
}
