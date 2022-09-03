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
public class ArchiveTaskVO {
	private UUID taskId;
	private String status;
}
