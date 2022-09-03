package com.yorosis.yoroflow.models.ws;

import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class WsRequest {

	private String httpMethod;
	private String remoteUrl;
	private int connectionTimeout;
	private int readTimeout;
	private String contentType;
	private String authorization;
	private BearerToken bearerToken;
	private JsonNode payload;

	private List<CustomHeader> customHeaders;
	private List<HeaderKeyValue> queryParams;
}
