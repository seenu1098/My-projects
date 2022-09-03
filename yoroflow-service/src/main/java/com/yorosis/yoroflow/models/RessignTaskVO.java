package com.yorosis.yoroflow.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RessignTaskVO {
	private UUID instanceId;
	private UUID instanceTaskId;
	private UUID assignedToUser;
	private UUID assignedToGroup;
	private String comments;
	private String status;
	private String taskType;
}
