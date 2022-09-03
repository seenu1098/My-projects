package com.yorosis.yoroflow.service.decision.operators;

import java.text.ParseException;

import com.yorosis.yoroflow.models.YoroFlowException;

public interface Operator {
	public boolean operate(Object leftAssignment, String operator, Object rightAssignment) throws YoroFlowException, ParseException;

	public String getDataType();

}
