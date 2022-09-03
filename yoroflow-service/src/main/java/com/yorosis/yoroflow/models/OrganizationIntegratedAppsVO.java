package com.yorosis.yoroflow.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrganizationIntegratedAppsVO {
	private String applicationName;
	private UUID id;
	private String authType;
	private String authToken;
	private String apiKey;
	private String apiSecret;
	private String clientId;
	private String clientSecret;
	private String isRemoved;
	private String authorizationUrl;
	private String redirectUrl;
	private String scopes;
	private String issuer;
	private String description;
}
