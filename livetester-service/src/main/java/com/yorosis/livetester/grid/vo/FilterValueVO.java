package com.yorosis.livetester.grid.vo;

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
}
