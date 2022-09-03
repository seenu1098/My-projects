package com.yorosis.yoroflow.models;

import java.util.List;

import com.yorosis.yoroflow.models.landingpage.WorkflowVO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class AllTaskVO {
	private String totalRecords;
	private String draftRecordsCount;
	private String totalAssignedRecordsCount;
	private String totalGroupRecordsCount;
	private String taskType;
	private String taskName;
	private List<AllTaskListVO> allTaskLists;
	private List<TaskNameListVO> allTaskNamesWithCount;
	private int filterIndex;
	private List<WorkflowVO> workflowTasksVo;
	private String taskCount;

}
