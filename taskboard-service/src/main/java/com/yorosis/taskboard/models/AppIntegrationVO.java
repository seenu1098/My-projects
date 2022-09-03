package com.yorosis.taskboard.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppIntegrationVO {
	private String applicationName;
	private String description;
	private boolean removeApp;
}
