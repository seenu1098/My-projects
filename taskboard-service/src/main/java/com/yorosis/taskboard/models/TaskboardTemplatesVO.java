package com.yorosis.taskboard.models;

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
public class TaskboardTemplatesVO {
	public UUID id;
	public String templateName;
	public JsonNode data;
	public String category;
	public String description;
}
