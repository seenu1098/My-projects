package com.yorosis.yoroflow.service.type;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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
import com.yorosis.yoroflow.models.ComputeRightAssignment;
import com.yorosis.yoroflow.models.ComputeVO;
import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.models.YoroDataType;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.service.computation.operators.DateComputation;
import com.yorosis.yoroflow.service.computation.operators.NumberComputation;
import com.yorosis.yoroflow.services.ValueType;
import com.yorosis.yoroflow.services.WorkflowService;
import com.yorosis.yoroflow.services.WorkflowUtils;

@Component
public class ComputeTaskType extends AbstractBaseTypeService implements TaskService {

	@Override
	public TaskType getTaskType() {
		return TaskType.COMPUTE_TASK;
	}

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private WorkflowService workflowService;

	@Autowired
	private NumberComputation numberComputation;

	@Autowired
	private DateComputation dateComputation;

	private static final String MAIN_SECTION = "mainSection";

	@Override
	public Map<String, List<FieldVO>> getFieldList(JsonNode taskProperty) {
		Map<String, List<FieldVO>> fieldList = new LinkedHashMap<>();
		fieldList.put(MAIN_SECTION, WorkflowUtils.getValueFromDataForComputeTask(taskProperty));
		return fieldList;
	}

	@Override
	public boolean processTypeSpecificService(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask)
			throws YoroFlowException, ParseException {
		List<ProcessDefTaskProperty> listTaskProperties = procDefinitionTask.getTaskProperties();

		if (!CollectionUtils.isEmpty(listTaskProperties)) {
			ProcessDefTaskProperty procDefTaskProperty = listTaskProperties.get(0);

			try {
				ComputeVO computevo = objectMapper.treeToValue(procDefTaskProperty.getPropertyValue(), ComputeVO.class);
				List<ValueType> listValueTypes = new ArrayList<>();
				for (ComputeRightAssignment rightAssignment : computevo.getRightAssignment()) {
					listValueTypes.add(workflowService.getFieldValue(procInstanceTask.getProcessInstance().getProcessInstanceId(),
							rightAssignment.getVariableName(), rightAssignment.getVariableType()));
				}

				ValueType valueType = null;
				if (computevo.getDataType() == YoroDataType.NUMBER || computevo.getDataType() == YoroDataType.FLOAT) {
					valueType = numberComputation.compute(computevo.getOperator(), listValueTypes);
				} else if (computevo.getDataType() == YoroDataType.DATE) {
					valueType = dateComputation.compute(computevo.getOperator(), listValueTypes);
				} else {
					throw new YoroFlowException("Unsupported DataType");
				}

				ObjectNode node = JsonNodeFactory.instance.objectNode();
				if (valueType.getClazz() == YoroDataType.FLOAT) {
					node.put(computevo.getLeftAssignment(), Float.valueOf(valueType.getValue().toString()));
				} else if (valueType.getClazz() == YoroDataType.NUMBER) {
					node.put(computevo.getLeftAssignment(), Integer.valueOf(valueType.getValue().toString()));
				} else if (valueType.getClazz() == YoroDataType.DATE) {
					node.put(computevo.getLeftAssignment(), (valueType.getValue().toString()));
				}
				procInstanceTask.setData(node);
				procInstanceTask.setTargetStepKey(procDefinitionTask.getTargetStepKey());
			} catch (JsonProcessingException e) {
				throw new YoroFlowException(ExceptionUtils.getRootCauseMessage(e));
			}
		}

		return true;
	}

	@Override
	public boolean canProceed(ProcessInstanceTask procInstanceTask) {
		return true;
	}

}
