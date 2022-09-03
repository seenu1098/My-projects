package com.yorosis.yoroflow.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class TaskDetailsResponse {
	private UUID instanceId;
	private UUID instanceTaskId;
	private String taskName;
	private String assignedTo;
	private TaskType taskType;
	private String targetStepKey;
	private Status workflowStatus;
	private UUID taskId;
	private boolean canProceed;
}
