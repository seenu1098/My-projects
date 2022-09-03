package com.yorosis.yoroflow.models;

import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTemplatesVO {
	private UUID id;
	private String templateName;
	private String description;
	private JsonNode workflowData;
	private String category;
}
