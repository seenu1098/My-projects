package com.yorosis.yoroflow.models;

import java.sql.Timestamp;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Subtask {
	private UUID id;
	private String subtaskStatus;
	private Timestamp startDate;
	private Timestamp dueDate;
	private String subtaskName;
	private UUID taskboardId;
	private UUID taskboardTaskId;
	private String subStatus;
	private String taskId;
}
