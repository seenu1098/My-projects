package com.yorosis.taskboard.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskboardExcelVO {
	private UUID taskboardId;
	private UUID workspaceId;
	private boolean isEmptyTaskboard;
}
