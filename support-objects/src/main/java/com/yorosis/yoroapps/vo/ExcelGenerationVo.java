package com.yorosis.yoroapps.vo;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExcelGenerationVo {
	private List<Map<String, String>> data;
	private List<ExcelHeadersVo> reportHeaders;
	private String totalRecords;
	private String reportName;
}
