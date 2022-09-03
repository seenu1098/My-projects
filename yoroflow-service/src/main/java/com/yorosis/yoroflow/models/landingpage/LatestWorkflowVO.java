package com.yorosis.yoroflow.models.landingpage;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class LatestWorkflowVO {
	private UUID id;
	private String workflowName;
	private String workflowKey;
	private Long workflowVersion;
	private String launchButtonName;
}
