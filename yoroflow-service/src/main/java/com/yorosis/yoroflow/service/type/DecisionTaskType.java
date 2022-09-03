package com.yorosis.yoroflow.service.type;

import java.text.ParseException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import javax.annotation.PostConstruct;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroflow.entities.ProcessDefTaskProperty;
import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.models.decision.Condition;
import com.yorosis.yoroflow.models.decision.DecisionLogic;
import com.yorosis.yoroflow.models.decision.Rule;
import com.yorosis.yoroflow.service.decision.operators.LogicOperator;
import com.yorosis.yoroflow.service.decision.operators.Operator;
import com.yorosis.yoroflow.services.ValueType;
import com.yorosis.yoroflow.services.WorkflowService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class DecisionTaskType extends AbstractBaseTypeService implements TaskService {

	@Override
	public TaskType getTaskType() {
		return TaskType.DECISION_TASK;
	}

	@Autowired
	private List<LogicOperator> listOperator;

	@Autowired
	private List<Operator> listComputationalOperator;

	@Autowired
	private WorkflowService workflowService;

	@Autowired
	private ObjectMapper objectMapper;

	private Map<String, Optional<LogicOperator>> mapLogicOperator = new HashMap<>();
	private Map<String, Optional<Operator>> mapComputationalOperator = new HashMap<>();

	@PostConstruct
	private void initialize() {
		listOperator.stream().forEach(s -> mapLogicOperator.put(s.getOperatorType(), Optional.of(s)));
		listComputationalOperator.stream().forEach(s -> mapComputationalOperator.put(s.getDataType(), Optional.of(s)));

	}

	@Override
	public boolean canProceed(ProcessInstanceTask procInstanceTask) {
		return true;
	}

	// getPropertyService (TaskId,fieldId)
	// 1) Webhook sends the same value
	// 2) First form to Webhook
	// noOfDaysRequested

	@Override
	public boolean processTypeSpecificService(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask)
			throws YoroFlowException, ParseException {
		List<ProcessDefTaskProperty> listTaskProperties = procDefinitionTask.getTaskProperties();

		if (!CollectionUtils.isEmpty(listTaskProperties)) {
			ProcessDefTaskProperty procDefTaskProperty = listTaskProperties.get(0);

			try {
				Condition condition = objectMapper.treeToValue(procDefTaskProperty.getPropertyValue(), Condition.class);
				DecisionLogic decisionLogic = condition.getDecisionLogic();

				Deque<Rule> ruleStack = new ArrayDeque<>();
				Deque<String> logicOperatorStack = new ArrayDeque<>();
				Deque<Boolean> statusStack = new ArrayDeque<>();

				List<Rule> rules = decisionLogic.getRules();
				logicOperatorStack.add(decisionLogic.getLogicOperator());

				rules.stream().forEach(ruleStack::push);
				while (!ruleStack.isEmpty()) {
					Rule rule = ruleStack.pop();

					if (rule.getDecisionLogic() != null) {
						ruleStack.push(null); // indicate no other nested Rule is present
						logicOperatorStack.push(rule.getDecisionLogic().getLogicOperator());
						rule.getDecisionLogic().getRules().stream().forEach(ruleStack::push);
					} else {
						statusStack.push(checkRule(procInstanceTask.getProcessInstance().getProcessInstanceId(), rule));
					}
				}

				String operator = logicOperatorStack.pop();
				Optional<LogicOperator> logicOperator = mapLogicOperator.get(operator);
				if (logicOperator.isPresent() && logicOperator.get().operate(statusStack)) {
					log.info("Moving to Match branch");
					procInstanceTask.setTargetStepKey(condition.getIfTargetTask());
				} else {
					log.info("Moving to Not Matched branch");
					procInstanceTask.setTargetStepKey(condition.getElseTargetTask());
				}
			} catch (JsonProcessingException e) {
				throw new YoroFlowException(ExceptionUtils.getRootCauseMessage(e));
			}
		}

		return true;
	}

	private boolean checkRule(UUID processInstanceID, Rule rule) throws YoroFlowException, ParseException {
		ValueType leftAssignment = workflowService.getFieldValue(processInstanceID, rule.getLeftAssignment().getVariableName(),
				rule.getLeftAssignment().getVariableType());
		ValueType rightAssignment = workflowService.getFieldValue(processInstanceID, rule.getRightAssignment().getVariableName(),
				rule.getRightAssignment().getVariableType());

		String dataType = rule.getLeftAssignment().getDataType().toLowerCase();
		if (StringUtils.equals(dataType, "boolean")) {
			dataType = "string";
		}
		Optional<Operator> computationalOperator = mapComputationalOperator.get(dataType);
		if (computationalOperator.isPresent()) {
			boolean result = computationalOperator.get().operate(leftAssignment.getValue(), rule.getOperator(), rightAssignment.getValue());

			log.info("Checking Rule: left value: {}, operator: {}, right value: {}.  Evaluated Result: {}", leftAssignment.getValue(), rule.getOperator(),
					rightAssignment.getValue(), result);
			return result;
		}

		throw new YoroFlowException("Operator not supported " + dataType);
	}

}
