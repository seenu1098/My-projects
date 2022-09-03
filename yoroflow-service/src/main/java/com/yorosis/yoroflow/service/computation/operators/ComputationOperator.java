package com.yorosis.yoroflow.service.computation.operators;

import java.util.List;

import com.yorosis.yoroflow.models.YoroDataType;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.services.ValueType;

public interface ComputationOperator {

	public ValueType compute(ComputeOperatorType computeOperatorType, List<ValueType> listOperands) throws YoroFlowException;

	public YoroDataType getComputeDataType();

}
