package com.yorosis.yoroflow.models.appwidgets;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioVO {
	private String taskboardName;
	private UUID taskboardId;
	private Long incompletedTaskCount;
	private Long completetedTaskCount;
	private Long totalTaskCount;
	private UUID workspaceId;
	private String taskboardKey;
	private List<String> ownerIdList;
}
