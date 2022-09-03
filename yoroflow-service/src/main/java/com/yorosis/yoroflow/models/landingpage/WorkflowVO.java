package com.yorosis.yoroflow.models.landingpage;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class WorkflowVO {
	private UUID id;
	private String taskName;
	private LocalDateTime createdDate;
	private LocalDateTime dueDate;
	private String viewDetailsButtonName;
	private String assignedTo;
	private List<String> assignedToGroup;
	private UUID instanceId;
	private boolean cancellableWorkflow;
	private String cancelButtonName;
	private UUID assignToId;
	private String workspaceName;
}
