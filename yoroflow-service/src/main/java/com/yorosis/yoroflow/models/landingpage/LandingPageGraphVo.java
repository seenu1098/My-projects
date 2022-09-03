package com.yorosis.yoroflow.models.landingpage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class LandingPageGraphVo {
	private String taskBoardAll;
	private String workflowAll;
	private String dueAll;
	private String taskBoardDueDate;
	private String workflowDueDate;
	private String taskBoardTodo;
	private String taskBoardProgress;
	private String taskBoardDone;
	private String workflowProcess;
	private String workflowCompleted;
}
