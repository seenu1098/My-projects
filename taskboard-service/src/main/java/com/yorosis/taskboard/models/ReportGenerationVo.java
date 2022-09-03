package com.yorosis.taskboard.models;

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
public class ReportGenerationVo {
	private List<Map<String, String>> data;
	private List<ReportHeadersVo> reportHeaders;
	private String totalRecords;
	private String reportName;
}
