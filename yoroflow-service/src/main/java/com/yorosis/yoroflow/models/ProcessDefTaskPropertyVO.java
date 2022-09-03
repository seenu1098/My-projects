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
public class ProcessDefTaskPropertyVO {
	private UUID taskId;
	private UUID taskPropertiesId;
	private String propertyName;
	private JsonNode propertyValue;
	private String processDefinitionId;
}
