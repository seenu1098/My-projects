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
public class ProcessInstanceResponse {
	private String startedBy;
	private LocalDateTime startedOn;
	private String status;
	private UUID instanceId;
	private UUID instanceTaskId;

}
