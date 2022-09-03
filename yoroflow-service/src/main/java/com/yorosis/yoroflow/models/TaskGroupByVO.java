package com.yorosis.yoroflow.models;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskGroupByVO {
	private UUID id;
	private String groupBy;
	private Integer index;
	private UUID sprintId;
	private List<UUID> assignedUserIdList;
	private List<UUID> taskboardLabelIdList;
	private List<String> taskboardPriorityList;
	private Boolean isUnAssignedUser;
	private Boolean isNoLabel;
	private Boolean isNoPriority;
	private String searchByTaskId;
	private Integer assigneeIndex;
	private Boolean isForCount;
	private String columnName;
	private String filterType;
	private String filterBy;
	private LocalDateTime startDate;
	private LocalDateTime endDate;
}
