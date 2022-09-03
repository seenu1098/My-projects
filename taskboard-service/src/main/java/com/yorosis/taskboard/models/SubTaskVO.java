package com.yorosis.taskboard.models;

import java.sql.Timestamp;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SubTaskVO {
	private UUID id;
	private String taskName;
	private Timestamp startDate;
	private Timestamp dueDate;
	private String taskType;
	private String status;
	private AssignTaskVO assignTaskVO;
	private String createdBy;
	private Timestamp createdOn;
	private String modifiedBy;
	private Timestamp modifiedOn;
}
