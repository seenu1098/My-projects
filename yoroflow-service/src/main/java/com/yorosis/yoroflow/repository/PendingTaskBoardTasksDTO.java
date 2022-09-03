package com.yorosis.yoroflow.repository;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PendingTaskBoardTasksDTO {

	private UUID taskBoardTaskId;
	private String taskId;
	private String taskboardKey;
	private UUID taskBoardId;
	private String workspaceKey;


}
