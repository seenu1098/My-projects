package com.yorosis.taskboard.models.activity;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class ActivityVo {
	private String activityData;
	private String activityType;
	private UUID parentId;
	private UUID childId;
	private UUID workspaceId;
	private UUID activityLogUserId;
}
