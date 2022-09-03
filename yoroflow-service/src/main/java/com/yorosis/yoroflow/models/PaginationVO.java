package com.yorosis.yoroflow.models;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaginationVO {
	private int index;
	private int size;
	private String direction;
	private String columnName;
	private String taskStatus;
	private boolean dueDateBoolean;
	private FilterValueVO[] filterValue;
	private UUID processInstanceId;
	private String wildSearch;
	private String dateSearch;
	private LocalDateTime startDate;
	private LocalDateTime endDate;
	private String taskType;
	private String taskName;
	private int filterIndex;
	private List<Integer> filterIndexList;
	private boolean isFromTaskboard;
	private UUID taskboardId;
	private String filterColumnName;
	private UUID workspaceId;
	private List<UUID> taskboardIdList;
	private String filterType;
	private Boolean allWorkspace;
}
