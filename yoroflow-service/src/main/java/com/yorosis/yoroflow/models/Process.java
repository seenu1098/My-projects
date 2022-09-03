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
public class Process {
	private String key;
	private String name;
	private String startKey;
	private String startType;
	private List<Task> taskList;
	private String workflowStructure;
}
