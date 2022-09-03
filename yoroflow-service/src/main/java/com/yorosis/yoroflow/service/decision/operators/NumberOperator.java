package com.yorosis.yoroflow.service.decision.operators;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import com.yorosis.yoroflow.models.YoroFlowException;

@Component
public class NumberOperator implements Operator {

	public boolean operate(Object leftAssignment, String operator, Object rightAssignment) throws YoroFlowException {
		float leftAssignmentValue = Float.parseFloat(leftAssignment.toString());
		float rightAssignmentValue = Float.parseFloat(rightAssignment.toString());
		if (StringUtils.equals(operator, "gt")) {
			return (leftAssignmentValue) > (rightAssignmentValue);
		} else if (StringUtils.equals(operator, "lt")) {
			return (leftAssignmentValue) < (rightAssignmentValue);
		} else if (StringUtils.equals(operator, "eq")) {
			return (leftAssignmentValue) == (rightAssignmentValue);
		} else if (StringUtils.equals(operator, "ge")) {
			return (leftAssignmentValue) >= (rightAssignmentValue);
		} else if (StringUtils.equals(operator, "le")) {
			return (leftAssignmentValue) <= (rightAssignmentValue);
		}
		throw new YoroFlowException("operator not  yet supported " + operator);
	}

	@Override
	public String getDataType() {
		return "number";
	}

}
