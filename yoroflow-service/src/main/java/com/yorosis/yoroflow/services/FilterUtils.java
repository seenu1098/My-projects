package com.yorosis.yoroflow.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.apache.commons.lang3.StringUtils;

import com.yorosis.yoroflow.models.FilterValueVO;
import com.yorosis.yoroflow.models.landingpage.AssignToVO;

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

	public static Boolean getNumber(Long value, FilterValueVO currentFilter, Boolean isMatched) {
		Long filterNumber = Long.parseLong(currentFilter.getFilterIdColumnValue());
		if (StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "gt") && (value > filterNumber)) {
			return isMatched;
		} else if (StringUtils.equals(currentFilter.getOperators(), "eq") && (value == filterNumber)) {
			return isMatched;
		} else if (StringUtils.equals(currentFilter.getOperators(), "ge") && (value >= filterNumber)) {
			return isMatched;
		} else if (StringUtils.equals(currentFilter.getOperators(), "lt") && (value < filterNumber)) {
			return isMatched;
		} else if (StringUtils.equals(currentFilter.getOperators(), "le") && (value <= filterNumber)) {
			return isMatched;
		} else {
			return false;
		}
	}

	public static Boolean getFloat(Double value, FilterValueVO currentFilter, Boolean isMatched) {
		Double filterNumber = Double.parseDouble(currentFilter.getFilterIdColumnValue());
		if (StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "gt") && (value > filterNumber)) {
			return isMatched;
		} else if (StringUtils.equals(currentFilter.getOperators(), "eq") && (value == filterNumber)) {
			return isMatched;
		} else if (StringUtils.equals(currentFilter.getOperators(), "ge") && (value >= filterNumber)) {
			return isMatched;
		} else if (StringUtils.equals(currentFilter.getOperators(), "lt") && (value < filterNumber)) {
			return isMatched;
		} else if (StringUtils.equals(currentFilter.getOperators(), "le") && (value <= filterNumber)) {
			return isMatched;
		} else {
			return false;
		}
	}

	public static Boolean getBoolean(Boolean filterValue, FilterValueVO currentFilter, Boolean isMatched) {
		if (StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "tr") && (filterValue)) {
			return isMatched;
		} else if (StringUtils.equals(currentFilter.getOperators(), "fa") && (!filterValue)) {
			return isMatched;
		} else {
			return false;
		}
	}

	public static Boolean getDateValue(LocalDate dateTimeValue, FilterValueVO currentFilter, Boolean isMatched) {
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		LocalDate dateTimeFromFilter = LocalDate.parse(currentFilter.getFilterIdColumnValue().subSequence(0, 10), formatter);
		LocalDate dateValue = dateTimeValue.minusDays(1L);
		if (StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "gt") && dateValue.isAfter(dateTimeFromFilter)) {
			return isMatched;
		} else if (StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "lt") && dateValue.isBefore(dateTimeFromFilter)) {
			return isMatched;
		} else if (StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "eq") && dateValue.isEqual(dateTimeFromFilter)) {
			return isMatched;
		} else if (StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "ge")
				&& (dateValue.isAfter(dateTimeFromFilter) || dateValue.isEqual(dateTimeFromFilter))) {
			return isMatched;
		} else if (StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "le")
				&& (dateValue.isBefore(dateTimeFromFilter) || dateValue.isEqual(dateTimeFromFilter))) {
			return isMatched;
		}
		return false;
	}

	public static Boolean getTotalTimeFilter(LocalDateTime StartTime, LocalDateTime endTime, FilterValueVO currentFilter, Boolean isMatched) {
		if (!StringUtils.isBlank(currentFilter.getTotalTimeFilterValue()) && !StringUtils.isBlank(currentFilter.getFilterIdColumnValue()) && StartTime != null
				&& endTime != null) {
			long filterTimeInMinutes = 0l;
			long totalTimeTaken = ChronoUnit.MINUTES.between(StartTime, endTime);
			if (StringUtils.contains(currentFilter.getTotalTimeFilterValue(), "days")) {
				filterTimeInMinutes = Long.parseLong(currentFilter.getFilterIdColumnValue()) * 24 * 60;
			} else if (StringUtils.contains(currentFilter.getTotalTimeFilterValue(), "hours")) {
				filterTimeInMinutes = Long.parseLong(currentFilter.getFilterIdColumnValue()) * 60;
			} else if (StringUtils.contains(currentFilter.getTotalTimeFilterValue(), "minutes")) {
				filterTimeInMinutes = Long.parseLong(currentFilter.getFilterIdColumnValue());
			}
			if (filterTimeInMinutes != 0l) {

				if (StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "gt") && totalTimeTaken > filterTimeInMinutes) {
					return isMatched;
				} else if (StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "lt") && totalTimeTaken < filterTimeInMinutes) {
					return isMatched;
				} else if (StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "eq") && totalTimeTaken == filterTimeInMinutes) {
					return isMatched;
				} else if (StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "ge") && (totalTimeTaken >= filterTimeInMinutes)) {
					return isMatched;
				} else if (StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "le") && (totalTimeTaken <= filterTimeInMinutes)) {
					return isMatched;
				} else {
					return false;
				}
			}
		}
		return isMatched;
	}

	public static Boolean getAssignTo(List<AssignToVO> valueList, FilterValueVO currentFilter, Boolean isMatched) {
		if (StringUtils.equals(currentFilter.getOperators(), "ne") && valueList.isEmpty()) {
			return isMatched;
		}
		boolean hasMatch = false;
		for (AssignToVO value : valueList) {
			if (StringUtils.equalsIgnoreCase(currentFilter.getOperators(), "cn")
					&& (StringUtils.containsIgnoreCase(value.getFirstName(), currentFilter.getFilterIdColumnValue())
							|| StringUtils.containsIgnoreCase(value.getLastName(), currentFilter.getFilterIdColumnValue())
							|| StringUtils.containsIgnoreCase(value.getName(), currentFilter.getFilterIdColumnValue()))) {
				hasMatch = isMatched;
			} else if (StringUtils.equals(currentFilter.getOperators(), "eq")
					&& (StringUtils.equalsIgnoreCase(value.getFirstName(), currentFilter.getFilterIdColumnValue())
							|| StringUtils.equalsIgnoreCase(value.getLastName(), currentFilter.getFilterIdColumnValue())
							|| StringUtils.equalsIgnoreCase(value.getName(), currentFilter.getFilterIdColumnValue()))) {
				hasMatch = isMatched;
			} else if (StringUtils.equals(currentFilter.getOperators(), "ne")
					&& (!StringUtils.equalsIgnoreCase(value.getFirstName(), currentFilter.getFilterIdColumnValue())
							|| !StringUtils.equalsIgnoreCase(value.getLastName(), currentFilter.getFilterIdColumnValue())
							|| !StringUtils.equalsIgnoreCase(value.getName(), currentFilter.getFilterIdColumnValue()))) {
				hasMatch = isMatched;
			}
		}
		return hasMatch;
	}
}
