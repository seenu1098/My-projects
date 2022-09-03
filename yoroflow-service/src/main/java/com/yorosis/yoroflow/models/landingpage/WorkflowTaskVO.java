package com.yorosis.yoroflow.models.landingpage;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class WorkflowTaskVO {
	private List<WorkflowVO> workflowTasksVo;
	private String totalRecords;
}
