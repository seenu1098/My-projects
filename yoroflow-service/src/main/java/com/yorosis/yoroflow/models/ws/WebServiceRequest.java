package com.yorosis.yoroflow.models.ws;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class WebServiceRequest {
	private String httpMethod;
	private String remoteUrl;
	private Integer connectionTimeout;
	private Integer readTimeout;
	private String contentType;
	private String authorization;
	private BearerToken bearerToken;
	private List<CustomHeader> customHeaders;
	private List<RequestPayload> webServiceRequestPayload;
	private List<HeaderKeyValue> queryParams;
	@JsonProperty("jsonText")
	private JsonNode responsePayload;

}
