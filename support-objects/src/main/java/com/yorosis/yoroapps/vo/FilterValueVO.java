package com.yorosis.yoroapps.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilterValueVO {
	private String filterIdColumn;
	private String operators;
	private String filterIdColumnValue;
	private String totalTimeFilterValue;
	private String filterDataType;
	private String repeatableFieldId;
}
