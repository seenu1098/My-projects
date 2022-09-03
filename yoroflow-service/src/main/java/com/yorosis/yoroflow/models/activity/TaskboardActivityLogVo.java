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
public class TaskboardActivityLogVo {
	private String activityData;
	private String activityType;
	private UUID userId;
	private Timestamp createdOn;
}
