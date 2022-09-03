package com.yorosis.yoroflow.models;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ProcessInstanceRequest {
	private UUID processDefinitionID;
	private String startedBy;
	private LocalDateTime startedOn;
	private String status;
	private UUID assignedTo;
	private LocalDateTime endTime;
	private UUID processInstanceId;
	private UUID taskId;

}
