package com.yorosis.yoroflow.models;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskListVO {
	private List<Map<String, String>> fieldValues;
	private List<ProcessInstanceListVO> processInstanceList;
}
