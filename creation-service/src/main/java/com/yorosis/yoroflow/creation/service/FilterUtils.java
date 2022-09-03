package com.yorosis.yoroflow.creation.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.apache.commons.lang3.StringUtils;

import com.yorosis.yoroapps.vo.FilterValueVO;

public class FilterUtils {
	public static Boolean getValue(String value, FilterValueVO currentFilter, Boolean isMatched) {
		if (StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "cn") && StringUtils.containsIgnoreCase(value, currentFilter.getFilterIdColumnValue())) {
			return isMatched;
		} else if (StringUtils.equals(currentFilter.getOperators(), "eq") && StringUtils.equalsIgnoreCase(value, currentFilter.getFilterIdColumnValue())) {
			return isMatched;
		} else if (StringUtils.equals(currentFilter.getOperators(), "bw") && StringUtils.startsWithIgnoreCase(value, currentFilter.getFilterIdColumnValue())) {
			return isMatched;
		} else if (StringUtils.equals(currentFilter.getOperators(), "ew") && StringUtils.endsWithIgnoreCase(value, currentFilter.getFilterIdColumnValue())) {
			return isMatched;
		} else {
			return false;
		}
	}

	public static Boolean getDateValue(LocalDate dateTimeValue, FilterValueVO currentFilter, Boolean isMatched) {
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		LocalDate dateTimeFromFilter = LocalDate.parse(currentFilter.getFilterIdColumnValue().subSequence(0, 10), formatter);
		LocalDate dateValue = dateTimeValue.minusDays(1L);
		if ((StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "gt") && dateValue.isAfter(dateTimeFromFilter))
				|| (StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "lt") && dateValue.isBefore(dateTimeFromFilter))
				|| (StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "eq") && dateValue.isEqual(dateTimeFromFilter))
				|| (StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "ge")
						&& (dateValue.isAfter(dateTimeFromFilter) || dateValue.isEqual(dateTimeFromFilter)))
				|| (StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "le")
						&& (dateValue.isBefore(dateTimeFromFilter) || dateValue.isEqual(dateTimeFromFilter)))) {
			return isMatched;
		}
		return false;
	}

}
