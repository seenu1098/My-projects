package com.yorosis.yoroflow.models;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ProcessInstanceLaunchedListVo {
	private String taskName;
	private String assignedTo;
	private LocalDateTime startTime;
	private LocalDateTime endTime;
	private String status;
	private String formId;
}
