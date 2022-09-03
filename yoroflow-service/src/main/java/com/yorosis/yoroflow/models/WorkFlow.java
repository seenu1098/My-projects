package com.yorosis.yoroflow.models;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkFlow {
	private UUID workflowId;
	private String key;
	private String name;
	private String startKey;
	private String status;
	private String startType;
	private boolean canPublish;
	private List<LinkNode> linkNodeList;
	private List<TaskNode> taskNodeList;
	private String uploadWorkflow;
	private String approve;
	private String install;
}
