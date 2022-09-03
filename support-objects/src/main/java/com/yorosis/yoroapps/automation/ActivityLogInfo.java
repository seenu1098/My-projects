package com.yorosis.yoroapps.automation;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActivityLogInfo {
	private String tenantId;
	private UUID parentId;
	private UUID childId;
	private UUID workspaceId;
	private UUID userId;
	private String activityType;
	private String activityData;
}
