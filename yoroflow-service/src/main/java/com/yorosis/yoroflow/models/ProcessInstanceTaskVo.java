package com.yorosis.yoroflow.models;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessInstanceTaskVo {
	UUID processInstanceTaskId;
	String taskName;
	String taskType;
	LocalDateTime startDate;
	LocalDateTime endDate;
	String status;
	Long totalTimeTaken;
	String taskReolvedBy;
}
