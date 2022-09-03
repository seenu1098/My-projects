package com.yorosis.yoroflow.models;

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
public class TaskSequenceVO {
	private UUID taskboardId;
	private String columnName;
	private List<TaskSequenceNumberVO> taskSequenceNumber;
}
