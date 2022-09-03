package com.yorosis.yoroflow.models.excel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ExcelTaskVo {
	private String value;
	private String variableType;
	private String headerWidth;
	private String headerId;
	private String dataType;
	private String dateFormat;
}
