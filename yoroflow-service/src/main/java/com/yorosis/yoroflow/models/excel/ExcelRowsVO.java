package com.yorosis.yoroflow.models.excel;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ExcelRowsVO {
	private String rowType;
	private List<ExcelTaskVo> excelDetails;
}
