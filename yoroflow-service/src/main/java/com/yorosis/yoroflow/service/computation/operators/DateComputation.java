package com.yorosis.yoroflow.service.computation.operators;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import com.yorosis.yoroflow.models.YoroDataType;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.services.ValueType;

@Component
public class DateComputation implements ComputationOperator {

	@Override
	public YoroDataType getComputeDataType() {
		return YoroDataType.DATE;
	}

	@Override
	public ValueType compute(ComputeOperatorType computeOperatorType, List<ValueType> listOperands)
			throws YoroFlowException {
		if (computeOperatorType == ComputeOperatorType.ADD) {
			return add(listOperands);
		} else if (computeOperatorType == ComputeOperatorType.DAYS_BETWEEN) {
			return daysbetween(listOperands);
		} else if (computeOperatorType == ComputeOperatorType.SUBTRACT) {
			return subtraction(listOperands);
		}

		throw new YoroFlowException("Unsupported Operation");
	}

	private ValueType add(List<ValueType> listOperands) {
		String finalDate = StringUtils.EMPTY;
		if (!CollectionUtils.isEmpty(listOperands) && listOperands.size() == 2 && listOperands.get(0).getValue() != null
				&& listOperands.get(0).getValue().toString().length() > 10) {
			LocalDate finalLocalDate = LocalDate
					.parse(listOperands.get(0).getValue().toString().substring(0, 10), getDateFormatter())
					.plusDays(Long.parseLong(listOperands.get(1).getValue().toString()));
			if (finalLocalDate != null) {
				finalDate = finalLocalDate.toString();
			}
		}
		return ValueType.builder().clazz(YoroDataType.DATE).value(finalDate).build();
	}

	private ValueType subtraction(List<ValueType> listOperands) {
		String finalDate = StringUtils.EMPTY;
		if (!CollectionUtils.isEmpty(listOperands) && listOperands.size() == 2 && listOperands.get(0).getValue() != null
				&& listOperands.get(0).getValue().toString().length() > 10) {
			LocalDate finalLocalDate = LocalDate
					.parse(listOperands.get(0).getValue().toString().substring(0, 10), getDateFormatter())
					.minusDays(Long.parseLong(listOperands.get(1).getValue().toString()));
			if (finalLocalDate != null) {
				finalDate = finalLocalDate.toString();
			}
		}

		return ValueType.builder().clazz(YoroDataType.DATE).value(finalDate).build();
	}

	private ValueType daysbetween(List<ValueType> listOperands) {
		long daysBetween = 0;
		if (!CollectionUtils.isEmpty(listOperands) && listOperands.size() == 2 && listOperands.get(0).getValue() != null
				&& listOperands.get(0).getValue().toString().length() > 10 && listOperands.get(1).getValue() != null
				&& listOperands.get(1).getValue().toString().length() > 10) {

			LocalDate finalLocalDateStart = LocalDate.parse(listOperands.get(0).getValue().toString().substring(0, 10),
					getDateFormatter());
			LocalDate finalLocalDateEnd = LocalDate.parse(listOperands.get(1).getValue().toString().substring(0, 10),
					getDateFormatter());
//			daysBetween = Period.between(finalLocalDateStart, finalLocalDateEnd).getDays();
			daysBetween = ChronoUnit.DAYS.between(finalLocalDateStart, finalLocalDateEnd);
		}

		return ValueType.builder().clazz(YoroDataType.NUMBER).value(daysBetween).build();
	}

	private DateTimeFormatter getDateFormatter() {
		return DateTimeFormatter.ofPattern("yyyy-MM-dd");
	}

}
