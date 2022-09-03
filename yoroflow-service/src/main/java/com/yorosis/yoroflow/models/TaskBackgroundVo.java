package com.yorosis.yoroflow.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskBackgroundVo {
	private String pendingTaskColor;
	private String completedTaskColor;
	private String errorTaskColor;
	private String draftTaskColor;
	private String approveTaskColor;
	private String rejectTaskColor;
	private long defaultPageSize;
}
