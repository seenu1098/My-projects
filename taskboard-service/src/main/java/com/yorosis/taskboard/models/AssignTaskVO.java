package com.yorosis.taskboard.models;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class AssignTaskVO {
	private UUID taskId;
	private UUID taskboardId;
	private List<String> removedAssigneeList;
	private List<AssignUserTaskVO> assigneeUserTaskList;
	private List<AssignGroupTaskVO> assigneeGroupTaskList;
	private List<UUID> taskboardLabelIdList;
	private List<UUID> assignedUserIdList;
	private List<String> taskboardPriorityList;
	private Boolean isUnAssignedUser;
	private Boolean isNoLabel;
	private Boolean isNoPriority;
	private String searchByTaskId;
}
