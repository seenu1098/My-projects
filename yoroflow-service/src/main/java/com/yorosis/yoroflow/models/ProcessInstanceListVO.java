package com.yorosis.yoroflow.models;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Deprecated
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ProcessInstanceListVO {
	private UUID processInstanceTaskId;
	private UUID userId;
	private UUID groupId;
	private String taskName;
	private LocalDateTime startTime;
	private LocalDateTime endTime;
	private LocalDateTime dueDate;
	private String status;
	private String description;
	private String draft;
	private LocalDateTime taskStartDate;
	private UUID processInstanceId;
	private Long duration;
	private List<FieldListVO> fieldValues;
	private String viewDetailsButtonName;
	private boolean cancellableWorkflow;
	private String cancelButtonName;
	private boolean enableSaveAsDraft;
	private String message;
	private String taskBackground;
	private String totalTimeTaken;
	private LocalDateTime instanceStartDate;
	private boolean hasError;
}
