package com.yorosis.yoroflow.models;

import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class EventAutomationVO {
	public UUID id;
	public UUID taskboardId;
	public JsonNode automation;
	public String isRuleActive;
	public String automationType;
}
