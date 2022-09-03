package com.yorosis.yoroflow.service.decision.operators;

import java.text.ParseException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import com.yorosis.yoroflow.models.YoroFlowException;

@Component
public class DateOperator implements Operator {
	public boolean operate(Object leftAssignment, String operator, Object rightAssignment) throws YoroFlowException, ParseException {
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		String leftAssignmentValue = leftAssignment.toString();
		String rightAssignmentValue = rightAssignment.toString();
		LocalDate leftAssignmentValueDate = LocalDate.parse(leftAssignmentValue.substring(0, 10), formatter);
		LocalDate rightAssignmentValueDate = LocalDate.parse(rightAssignmentValue.substring(0, 10), formatter);

		if (StringUtils.equals(operator, "lt")) {
			return leftAssignmentValueDate.isBefore(rightAssignmentValueDate);
		} else if (StringUtils.equals(operator, "gt")) {
			return leftAssignmentValueDate.isAfter(rightAssignmentValueDate);
		} else if (StringUtils.equals(operator, "eq")) {
			return leftAssignmentValueDate.isEqual(rightAssignmentValueDate);
		}
		throw new YoroFlowException("operator not  yet supported " + operator);
	}

	public String getDataType() {
		return "date";
	}
}
