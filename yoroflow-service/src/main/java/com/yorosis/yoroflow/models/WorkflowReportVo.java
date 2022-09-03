package com.yorosis.yoroflow.models;

import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowReportVo {
	private UUID id;
	private String reportType;
	private String reportName;
	private String workflowName;
	private String workflowKey;
	private int workflowVersion;
	private String taskName;
	private boolean enableReport;
	private boolean latestVersion;
	private JsonNode reportJson;
	private UUID taskId;
	private UUID workspaceId;
	private List<UUID> groupId;
}
