package com.yorosis.yoroflow.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskBoardTaskSummaryVo {
	private String taskboardName;
	private long inProcessCount;
	private long completedCount;
}
