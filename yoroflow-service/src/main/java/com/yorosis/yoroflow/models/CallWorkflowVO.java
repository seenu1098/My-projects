package com.yorosis.yoroflow.models;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class CallWorkflowVO {
	private String workflowName;
	private String workflowKey;
	private Long workflowVersion;
	private List<CallWorkflowFields> callAnotherWorkflowFields;
	private String alias;
}
