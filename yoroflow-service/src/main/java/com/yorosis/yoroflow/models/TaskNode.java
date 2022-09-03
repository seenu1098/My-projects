package com.yorosis.yoroflow.models;

import com.yorosis.yoroflow.models.decision.Condition;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskNode {
	private String key;
	private String taskType;
	private String label;
	private ProcessDefTaskPropertyVO taskProperty;
	private NodePosition position;
	private Condition condition;
}
