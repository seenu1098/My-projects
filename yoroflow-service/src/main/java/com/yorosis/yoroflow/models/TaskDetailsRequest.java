package com.yorosis.yoroflow.models;

import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDetailsRequest {
	private UUID instanceId;
	private UUID instanceTaskId;
	private JsonNode taskData;
}
