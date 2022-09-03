package com.yorosis.yoroapps.menu.vo;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowReportMenuVo {
	private UUID reportId;
	private String reportName;
	private boolean enableReport;
}
