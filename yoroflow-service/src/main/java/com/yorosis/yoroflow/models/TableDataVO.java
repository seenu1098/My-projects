package com.yorosis.yoroflow.models;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableDataVO {
	@SuppressWarnings("deprecation")
	private List<ProcessInstanceListVO> data;
	private String totalRecords;
	private String draftRecordsCount;
	private String assignedRecordsCount;
	private String groupRecordsCount;
	private String taskType;
	private String taskName;
	private List<AllTaskListVO> allTaskLists;
}
