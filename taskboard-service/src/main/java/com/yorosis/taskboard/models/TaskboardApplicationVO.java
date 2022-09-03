package com.yorosis.taskboard.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskboardApplicationVO {
	private UUID id;
	private UUID taskboardId;
	private String applicationName;
	private String authType;
	private String authToken;
	private String apiKey;
	private String apiSecret;
	private String clientId;
	private String clientSecret;
}
