package com.yorosis.yoroflow.rendering.service.vo;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowVo {
	private String instanceId;
	private String instanceTaskId;
	private JsonNode taskData;
}
