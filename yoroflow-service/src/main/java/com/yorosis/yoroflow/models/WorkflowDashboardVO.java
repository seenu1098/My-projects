package com.yorosis.yoroflow.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowDashboardVO {
	private Long inProcessListCount;
	private Long completedListCount;
	private Long errorListCount;
	private Long smsCount;
}
