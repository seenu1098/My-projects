package com.yorosis.yoroflow.models;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessDefinitionVO {
	private UUID processDefinitionId;
	private String key;
	private String processDefinitionName;
	private String status;
	private String propertyType;
	private Long workflowVersion;
	private String launchButtonName;
	private String manualWorkflowsCount;
	private String scheduledWorkflowsCount;
	private String webserviceWorkflowsCount;
	private boolean enablePin;
	@Builder.Default
	private boolean canEdit = false;
	@Builder.Default
	private boolean canLaunch = false;
	@Builder.Default
	private boolean canPublish = false;
	private LocalDateTime updatedDate;
	private String uploadWorkflow;
	private String approve;
	private String install;
	private UUID workspaceId;
}
