package com.yorosis.yoroflow.service.decision.operators;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import com.yorosis.yoroflow.models.YoroFlowException;

@Component
public class StringOperator implements Operator {
	public boolean operate(Object leftAssignment, String operator, Object rightAssignment) throws YoroFlowException {
		String leftAssignmentValue = leftAssignment.toString();
		String rightAssignmentValue = rightAssignment.toString();
		if (StringUtils.equals(operator, "eq")) {
			return StringUtils.equalsIgnoreCase(leftAssignmentValue, rightAssignmentValue);
		} else if (StringUtils.equals(operator, "ne")) {
			return !StringUtils.equalsIgnoreCase(leftAssignmentValue, rightAssignmentValue);
		} else if (StringUtils.equals(operator, "bw")) {
			return StringUtils.startsWith(leftAssignmentValue, rightAssignmentValue);
		} else if (StringUtils.equals(operator, "ew")) {
			return StringUtils.endsWith(leftAssignmentValue, rightAssignmentValue);
		} else if (StringUtils.equals(operator, "cn")) {
			return StringUtils.contains(leftAssignmentValue, rightAssignmentValue);
		}
		throw new YoroFlowException("operator not  yet supported -->" + operator);
	}

	@Override
	public String getDataType() {
		return "string";
	}

}
