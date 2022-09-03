package com.yorosis.taskboard.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class EventAutomationConfigurationVO {
	private UUID id;
	private String automation;
	private String automationType;
	private UUID parentId;
	private String category;
	private String automationSubType;
}
