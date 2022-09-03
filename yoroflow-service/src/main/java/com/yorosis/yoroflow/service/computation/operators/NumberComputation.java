package com.yorosis.yoroflow.service.computation.operators;

import java.text.DecimalFormat;
import java.util.List;

import org.apache.commons.lang3.math.NumberUtils;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import com.yorosis.yoroflow.models.YoroDataType;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.services.ValueType;

@Component
public class NumberComputation implements ComputationOperator {

	private static final String INVALID_NUMBER = "Invalid number ";

	@Override
	public YoroDataType getComputeDataType() {

		return YoroDataType.NUMBER;
	}

	@Override
	public ValueType compute(ComputeOperatorType computeOperatorType, List<ValueType> listOperands)
			throws YoroFlowException {
		if (computeOperatorType == ComputeOperatorType.ADD) {
			return add(listOperands);
		} else if (computeOperatorType == ComputeOperatorType.SUBTRACT) {
			return subtract(listOperands);
		} else if (computeOperatorType == ComputeOperatorType.DIVIDE) {
			return divide(listOperands);
		} else if (computeOperatorType == ComputeOperatorType.MULTIPLY) {
			return multiple(listOperands);
		} else if (computeOperatorType == ComputeOperatorType.MODULUS) {
			return modulus(listOperands);
		}
		throw new YoroFlowException("Unsupported Operation");
	}

	private ValueType modulus(List<ValueType> listOperands) throws YoroFlowException {
		Float modulus = 0f;

		if (!CollectionUtils.isEmpty(listOperands) && listOperands.size() == 2 && listOperands.get(0).getValue() != null
				&& listOperands.get(1).getValue() != null) {

			if (NumberUtils.isCreatable(listOperands.get(0).getValue().toString())
					&& NumberUtils.isCreatable(listOperands.get(1).getValue().toString())) {
				modulus = Float.valueOf(listOperands.get(0).getValue().toString())
						% Float.valueOf(listOperands.get(1).getValue().toString());
			} else {
//				throw new YoroFlowException(INVALID_NUMBER);
				modulus = 0f;
			}

		}
		return ValueType.builder().clazz(YoroDataType.FLOAT).value(modulus).build();
	}

	private ValueType add(List<ValueType> listOperands) throws YoroFlowException {
		Float sum = 0f;
		for (ValueType valueType : listOperands) {
			if (valueType.getValue() != null && NumberUtils.isCreatable(valueType.getValue().toString())) {
				sum += Float.valueOf(valueType.getValue().toString());
			} else {
//				throw new YoroFlowException(INVALID_NUMBER + valueType.getValue());
				sum = 0f;
			}
		}

		return ValueType.builder().clazz(YoroDataType.FLOAT).value(sum).build();
	}

	private ValueType subtract(List<ValueType> listOperands) throws YoroFlowException {
		Float sum = 0f;
		for (ValueType valueType : listOperands) {
			if (valueType.getValue() != null && NumberUtils.isCreatable(valueType.getValue().toString())) {
				if (sum != 0) {
					sum -= Float.valueOf(valueType.getValue().toString());
				} else {
					sum = Float.valueOf(valueType.getValue().toString());
				}
			} else {
//				throw new YoroFlowException(INVALID_NUMBER + valueType.getValue());
				sum = 0f;
			}
		}

		return ValueType.builder().clazz(YoroDataType.FLOAT).value(sum).build();
	}

	private ValueType multiple(List<ValueType> listOperands) throws YoroFlowException {
		Float product = 1f;
		for (ValueType valueType : listOperands) {
			if (valueType.getValue() != null && NumberUtils.isCreatable(valueType.getValue().toString())) {
				product *= Float.valueOf(valueType.getValue().toString());
			} else {
//				throw new YoroFlowException(INVALID_NUMBER + valueType.getValue());
				product = 1f;
			}
		}

		return ValueType.builder().clazz(YoroDataType.FLOAT).value(product).build();
	}

	private ValueType divide(List<ValueType> listOperands) throws YoroFlowException {
		Float result = 0.0f;
		DecimalFormat newFormat = new DecimalFormat("#.###");

		if (!CollectionUtils.isEmpty(listOperands) && listOperands.size() == 2 && listOperands.get(0).getValue() != null
				&& listOperands.get(1).getValue() != null) {

			if (NumberUtils.isCreatable(listOperands.get(0).getValue().toString())
					&& NumberUtils.isCreatable(listOperands.get(1).getValue().toString())) {
				if (Float.valueOf(listOperands.get(1).getValue().toString()) != 0f) {
					result = Float.valueOf(listOperands.get(0).getValue().toString())
							/ Float.valueOf(listOperands.get(1).getValue().toString());
				}
			} else {
//				throw new YoroFlowException(INVALID_NUMBER);
				result = 0.0f;
			}

		}
		return ValueType.builder().clazz(YoroDataType.FLOAT).value(newFormat.format(result)).build();
	}

}
