package com.yorosis.taskboard.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class TaskNameListVO {
	private String taskName;
	private String taskType;
	private int groupCount;
	private int userCount;
	private String randomColor;
}
