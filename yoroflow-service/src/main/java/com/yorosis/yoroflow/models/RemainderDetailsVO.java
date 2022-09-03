package com.yorosis.yoroflow.models;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class RemainderDetailsVO {
	private String remainderType;
	private int remainderLevel;
	private int reminderTime;
	private String reminderUnits;
	private JsonNode smsNotification;
	private JsonNode emailNotification;
}
