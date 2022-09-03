package com.yorosis.yoroapps.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DateValidationVO {
	private boolean dateValidation;
	private boolean allowFutureDate;
	private String operator;
	private String fromField;
	private String toField;

}