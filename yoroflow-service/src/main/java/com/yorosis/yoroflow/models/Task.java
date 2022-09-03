package com.yorosis.yoroflow.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Task {

	@EqualsAndHashCode.Include()
	private String key;
	@EqualsAndHashCode.Include()
	private String name;
	private TaskType taskType;
	private String targetTask;
	private String formId;
	private String condition;
	private ProcessDefTaskPropertyVO taskProperty;
}
