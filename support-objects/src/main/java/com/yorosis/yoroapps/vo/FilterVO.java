package com.yorosis.yoroapps.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilterVO {
	private String columnName;
	private String value;
	private String dataType;
	private String valueType;
	private String opertator;
	private String fieldName;
}
