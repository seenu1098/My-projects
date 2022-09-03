package com.yorosis.yoroflow.models.activity;

import java.sql.Timestamp;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowActivityLogVo {
	private String activityData;
	private String activityType;
	private String taskName;
	private UUID userId;
	private Timestamp createdOn;
}
