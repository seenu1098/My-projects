package com.yorosis.yoroflow.models.taskboard;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeleteTaskVO {
	private UUID taskId;
	private Boolean isRemoveSubTask;
}
