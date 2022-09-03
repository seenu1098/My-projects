package com.yorosis.yoroflow.service.type;

import java.text.ParseException;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
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
import com.yorosis.yoroflow.models.decision.DecisionTableConditions;
import com.yorosis.yoroflow.models.decision.DecisionTableModel;
import com.yorosis.yoroflow.models.decision.ResolvedDecisionConditions;
import com.yorosis.yoroflow.models.decision.Values;
import com.yorosis.yoroflow.models.decision.VariableValues;
import com.yorosis.yoroflow.service.decision.operators.DateOperator;
import com.yorosis.yoroflow.service.decision.operators.NumberOperator;
import com.yorosis.yoroflow.service.decision.operators.StringOperator;
import com.yorosis.yoroflow.services.ValueType;
import com.yorosis.yoroflow.services.VariableType;
import com.yorosis.yoroflow.services.WorkflowService;
import com.yorosis.yoroflow.services.WorkflowUtils;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class DecisionTableType extends AbstractBaseTypeService implements TaskService {
	@Override
	public TaskType getTaskType() {
		return TaskType.DECISION_TABLE;
	}

	@Autowired
	private StringOperator strOperator;
	
	@Autowired
	private DateOperator dateOperator;

	@Autowired
	private NumberOperator numberOperator;

	@Autowired
	private WorkflowService workflowService;

	@Autowired
	private ObjectMapper objectMapper;

	private static final String MAIN_SECTION = "mainSection";

	@Override
	public Map<String, List<FieldVO>> getFieldList(JsonNode taskProperty) {
		Map<String, List<FieldVO>> fieldList = new LinkedHashMap<>();
		fieldList.put(MAIN_SECTION, WorkflowUtils.getValueFromDataForDesicisionTableTask(taskProperty));
		return fieldList;
	}

	@Override
	public boolean processTypeSpecificService(ProcessInstanceTask procInstanceTask,
			ProcessDefinitionTask procDefinitionTask) throws YoroFlowException, ParseException {
		List<ProcessDefTaskProperty> listTaskProperties = procDefinitionTask.getTaskProperties();

		if (!CollectionUtils.isEmpty(listTaskProperties)) {
			ProcessDefTaskProperty procDefTaskProperty = listTaskProperties.get(0);

			try {
				DecisionTableModel decisionTableModel = objectMapper.treeToValue(procDefTaskProperty.getPropertyValue(),
						DecisionTableModel.class);
				// Each VariableValues refers to 1 row in datatable

				List<DecisionTableConditions> conditionHeaders = decisionTableModel.getConditions();
				Map<String, ResolvedDecisionConditions> mapDTConditions = getConditionHeaders(procInstanceTask,
						conditionHeaders);
				List<VariableValues> conditionVariableList = decisionTableModel.getConditionVariableList();

				int index = 0;
				int indexWhenConditionMet = -1;
				Boolean conditionSatisfied = false;
				for (VariableValues variableValues : conditionVariableList) {
					if (isAllConditionsTrue(variableValues, mapDTConditions, procInstanceTask)) {
						indexWhenConditionMet = index;
						conditionSatisfied = true;
						if (StringUtils.equals(decisionTableModel.getOperator(), "breakWhenMatch")) {
							break;
						}

					}
					index++;
				}
				if (BooleanUtils.isTrue(conditionSatisfied) && indexWhenConditionMet >= 0) {
					procInstanceTask.setData(setAssignedToVariable(indexWhenConditionMet,
							decisionTableModel.getAssignToVariableValuesList(), procInstanceTask,
							decisionTableModel.getAssignToVariable()));

				}
				procInstanceTask.setTargetStepKey(procDefinitionTask.getTargetStepKey());
			} catch (JsonProcessingException e) {
				throw new YoroFlowException(ExceptionUtils.getRootCauseMessage(e));
			}
		}

		return true;
	}

	private JsonNode setAssignedToVariable(int indexWhenConditionMet, List<VariableValues> list,
			ProcessInstanceTask procInstanceTask, DecisionTableConditions assignVariable) {
		if (!CollectionUtils.isEmpty(list)) {
			VariableValues assignedVariableValue = list.get(indexWhenConditionMet);
			Values assignedVal = assignedVariableValue.getValues().get(0);
			ValueType valueType = workflowService.getFieldValue(
					procInstanceTask.getProcessInstance().getProcessInstanceId(), assignedVal.getValue(),
					assignedVal.getVariableType());
			return WorkflowUtils.getNodeValue(valueType, assignVariable.getName());
		}
		return null;

	}

	private Map<String, ResolvedDecisionConditions> getConditionHeaders(ProcessInstanceTask procInstanceTask,
			List<DecisionTableConditions> decisionTableConditions) {
		if (Optional.ofNullable(decisionTableConditions).isPresent()) {
			Map<String, ResolvedDecisionConditions> mapDTConditions = new HashMap<>();
			for (DecisionTableConditions decisionTableCondition : decisionTableConditions) {
				ResolvedDecisionConditions resolvedDecisionConditions = ResolvedDecisionConditions.builder()
						.dataType(decisionTableCondition.getDataType()).operator(decisionTableCondition.getOperator())
						.variableType(workflowService.getFieldValue(
								procInstanceTask.getProcessInstance().getProcessInstanceId(),
								decisionTableCondition.getName(), decisionTableCondition.getVariableType()))
						.build();

				mapDTConditions.put(decisionTableCondition.getName(), resolvedDecisionConditions);
			}
			return mapDTConditions;

		}
		return Collections.emptyMap();

	}

	private boolean isAllConditionsTrue(VariableValues variableValues,
			Map<String, ResolvedDecisionConditions> mapDTConditions, ProcessInstanceTask procInstanceTask) {
		if (Optional.ofNullable(variableValues).isPresent() && !CollectionUtils.isEmpty(variableValues.getValues())) {
			List<Values> listValues = variableValues.getValues();
			return listValues.stream().allMatch(s -> {
				ValueType rightSideVT = workflowService.getFieldValue(
						procInstanceTask.getProcessInstance().getProcessInstanceId(), s.getValue(),
						s.getVariableType());
				ResolvedDecisionConditions leftSideVT = mapDTConditions.get(s.getVariableName());
				try {
					if (StringUtils.equals(leftSideVT.getDataType(), "string")) {
						return strOperator.operate(leftSideVT.getVariableType(), leftSideVT.getOperator(), rightSideVT);
					} else if (StringUtils.equals(leftSideVT.getDataType(), "date")) {
						return dateOperator.operate(leftSideVT.getVariableType(), leftSideVT.getOperator(),
								rightSideVT);
					} else if (StringUtils.equals(leftSideVT.getDataType(), "float")) {
						return numberOperator.operate(leftSideVT.getVariableType(), leftSideVT.getOperator(),
								rightSideVT);
					} else {
						throw new YoroFlowException("Unsupported DataType");
					}

				} catch (YoroFlowException | ParseException e) {
//					log.warn("Error occurred - Decision Table", e);
				}
				return false;

			});

		}
		return false;

	}

	@Override
	public boolean canProceed(ProcessInstanceTask procInstanceTask) {
		// TODO Auto-generated method stub
		return true;
	}

}
