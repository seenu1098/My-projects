package com.yorosis.yoroapps.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NumberFieldValidtionVO {
	private boolean numberFieldValidation;
	private String operator;
	private String fromField;
	private String toField;
}
