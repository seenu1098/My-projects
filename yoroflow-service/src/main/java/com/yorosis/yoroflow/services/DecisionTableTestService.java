package com.yorosis.yoroflow.services;

import java.text.ParseException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import javax.transaction.Transactional;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.models.ProcessDefTaskPropertyVO;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.models.decision.DecisionTableConditions;
import com.yorosis.yoroflow.models.decision.ResolvedDecisionConditions;
import com.yorosis.yoroflow.models.decision.Values;
import com.yorosis.yoroflow.models.decision.VariableValues;
import com.yorosis.yoroflow.repository.ProcessDefinitionTaskRepo;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskRepo;
import com.yorosis.yoroflow.service.decision.operators.DateOperator;
import com.yorosis.yoroflow.service.decision.operators.NumberOperator;
import com.yorosis.yoroflow.service.decision.operators.StringOperator;

@Service
public class DecisionTableTestService {

	@Autowired
	private StringOperator strOperator;

	@Autowired
	private DateOperator dateOperator;

	@Autowired
	private NumberOperator numberOperator;

	@Autowired
	private WorkflowService workflowService;

	@Autowired
	private DBTaskService dbTaskService;

	@Autowired
	private ObjectMapper objMapper;

	@Autowired
	private ProcessDefTaskPropertyService processDefTaskPropertyService;

	@Autowired
	private ProcessDefinitionTaskRepo processDefinitionTaskRepo;

	@Autowired
	private ProcessInstanceTaskRepo processInstanceTaskRepo;

	@Transactional
	public boolean processTypeSpecificService(UUID procInstanceTaskId, UUID procDefinitionTaskId)
			throws YoroFlowException, ParseException {
		ProcessInstanceTask procInstanceTask = processInstanceTaskRepo.findByProcessInstanceTaskId(procInstanceTaskId);
		ProcessDefinitionTask procDefinitionTask = processDefinitionTaskRepo
				.findByTaskIdAndTenantId(procDefinitionTaskId, "customer_0000249");
		List<ObjectNode> listObjectNode = dbTaskService
				.execute(procInstanceTask.getProcessInstance().getProcessInstanceId(), procDefinitionTask.getTaskId());

		if (!CollectionUtils.isEmpty(listObjectNode)) {
			ProcessDefTaskPropertyVO defTaskPropertyVo = processDefTaskPropertyService
					.getTaskPropertyInfo(procDefinitionTask.getTaskId());
			if (defTaskPropertyVo != null) {
				JsonNode propertyValue = defTaskPropertyVo.getPropertyValue();
				if (propertyValue != null && propertyValue.has("actionType") && propertyValue.get("actionType") != null
						&& StringUtils.equals(propertyValue.get("actionType").asText(), "select")) {
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

			procInstanceTask.setTargetStepKey(procDefinitionTask.getTargetStepKey());
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
}
