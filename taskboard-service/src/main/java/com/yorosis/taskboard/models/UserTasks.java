package com.yorosis.taskboard.models;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode
public class UserTasks {

	@EqualsAndHashCode.Include
	private UUID userId;

	@Builder.Default
	private Set<TaskboardTaskVO> TaskBoardTaskVOs = new HashSet<>();

}
