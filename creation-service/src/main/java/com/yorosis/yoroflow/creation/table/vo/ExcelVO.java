package com.yorosis.yoroflow.creation.table.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExcelVO {
	private List<String> excelHeaders;
	private String response;
}
