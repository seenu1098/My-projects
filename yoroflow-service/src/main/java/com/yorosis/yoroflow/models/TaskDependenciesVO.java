package com.yorosis.yoroflow.models;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskDependenciesVO {
	private UUID taskId;
	private List<TaskboardTaskVO> waitingOn;
	private List<TaskboardTaskVO> blocking;
	private List<TaskboardTaskVO> relatedTasks;
	private List<UUID> removeDependenciesId;
}
