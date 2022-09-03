package com.yorosis.yoroflow.models.activity;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogVo {
	private Long totalCount;
	private List<TaskboardActivityLogVo> taskboardActivityLogVoList;
	private List<WorkflowActivityLogVo> workflowActivityLogVoList;
}
