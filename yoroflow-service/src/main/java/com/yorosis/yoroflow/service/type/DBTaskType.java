package com.yorosis.yoroflow.service.type;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.models.ProcessDefTaskPropertyVO;
import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.services.DBTaskService;
import com.yorosis.yoroflow.services.ProcessDefTaskPropertyService;

@Component
public class DBTaskType extends AbstractBaseTypeService implements TaskService {

	@Autowired
	private DBTaskService dbTaskService;

	@Autowired
	private ObjectMapper objMapper;

	@Autowired
	private ProcessDefTaskPropertyService processDefTaskPropertyService;

	@Override
	public TaskType getTaskType() {
		return TaskType.DB_TASK;
	}

	private static final String MAIN_SECTION = "mainSection";
	private static final String SUB_SECTION = "subSection";

	@Override
	public Map<String, List<FieldVO>> getFieldList(JsonNode taskProperty) {
		List<FieldVO> listFieldVO = new ArrayList<>();
		List<FieldVO> listFieldSubVO = new ArrayList<>();
		Map<String, List<FieldVO>> fieldList = new LinkedHashMap<>();

		if (taskProperty.has("fieldValues") && taskProperty.has("tableName")) {
			if (taskProperty != null && taskProperty.has("actionType") && taskProperty.get("actionType") != null
					&& StringUtils.equals(taskProperty.get("actionType").asText(), "select")
					&& taskProperty.has("isSingleValue") && taskProperty.get("isSingleValue") != null
					&& taskProperty.get("isSingleValue").asBoolean() == true) {
				JsonNode jsonText = taskProperty.get("fieldValues");
				Iterator<JsonNode> fieldNames = jsonText.iterator();
				while (fieldNames.hasNext()) {
					JsonNode jsonField = fieldNames.next();
					if (jsonField.has("aliasName") && jsonField.has("dataType")) {
						String aliasName = jsonField.get("aliasName").asText();
						String dataType = jsonField.get("dataType").asText();
						listFieldVO.add(
								FieldVO.builder().fieldName(aliasName).fieldId(aliasName).datatype(dataType).build());
					}
				}
				if (!listFieldVO.isEmpty()) {
					fieldList.put(MAIN_SECTION, listFieldVO);
				}
				return fieldList;
			} else {
				listFieldVO.add(FieldVO.builder().fieldName(taskProperty.get("tableName").asText())
						.fieldId(taskProperty.get("tableName").asText()).datatype("array").build());
				JsonNode jsonText = taskProperty.get("fieldValues");
				Iterator<JsonNode> fieldNames = jsonText.iterator();
				while (fieldNames.hasNext()) {
					JsonNode jsonField = fieldNames.next();
					if (jsonField.has("aliasName") && jsonField.has("dataType")) {
						String aliasName = jsonField.get("aliasName").asText();
						String dataType = jsonField.get("dataType").asText();
						listFieldSubVO.add(FieldVO.builder().repeatableFieldName(taskProperty.get("tableName").asText())
								.repeatableFieldId(taskProperty.get("tableName").asText()).fieldName(aliasName)
								.fieldId(aliasName).datatype(dataType).build());
					}
				}
			}
		}
		if (!listFieldSubVO.isEmpty()) {
			fieldList.put(MAIN_SECTION, listFieldVO);
			fieldList.put(SUB_SECTION, listFieldSubVO);
		}
		return fieldList;
	}

	@Override
	public boolean processTypeSpecificService(ProcessInstanceTask procInstanceTask,
			ProcessDefinitionTask procDefinitionTask) throws YoroFlowException, ParseException {
		List<ObjectNode> listObjectNode = dbTaskService
				.execute(procInstanceTask.getProcessInstance().getProcessInstanceId(), procDefinitionTask.getTaskId());

		if (!CollectionUtils.isEmpty(listObjectNode)) {
			ProcessDefTaskPropertyVO defTaskPropertyVo = processDefTaskPropertyService
					.getTaskPropertyInfo(procDefinitionTask.getTaskId());
			if (defTaskPropertyVo != null) {
				JsonNode propertyValue = defTaskPropertyVo.getPropertyValue();
				if (propertyValue != null && propertyValue.has("actionType") && propertyValue.get("actionType") != null
						&& StringUtils.equals(propertyValue.get("actionType").asText(), "select")
						&& propertyValue.has("isSingleValue") && propertyValue.get("isSingleValue") != null
						&& propertyValue.get("isSingleValue").asBoolean() == true) {
					procInstanceTask.setData(listObjectNode.get(0));
				} else {
					ObjectNode arrayobjectnode = objMapper.createObjectNode();
					ArrayNode arrayNode = objMapper.createArrayNode();
					objMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
					for (ObjectNode p : listObjectNode) {
						arrayNode.add(p);
					}
					if (propertyValue != null && propertyValue.has("tableName")
							&& propertyValue.get("tableName") != null) {
						arrayobjectnode.set(propertyValue.get("tableName").asText(), arrayNode);
						procInstanceTask.setData(arrayobjectnode);
					}
				}
			}
		}
		procInstanceTask.setTargetStepKey(procDefinitionTask.getTargetStepKey());
		return true;
	}

	@Override
	public boolean canProceed(ProcessInstanceTask procInstanceTask) {
		return true;
	}
}
