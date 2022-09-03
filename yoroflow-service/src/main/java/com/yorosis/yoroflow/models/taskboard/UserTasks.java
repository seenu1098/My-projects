package com.yorosis.yoroflow.models.taskboard;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import com.yorosis.yoroflow.models.TaskboardTaskVO;

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
