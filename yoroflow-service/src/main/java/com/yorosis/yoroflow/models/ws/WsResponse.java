package com.yorosis.yoroflow.models.ws;

import java.util.Optional;

import kong.unirest.JsonNode;
import kong.unirest.UnirestParsingException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class WsResponse {

	private int statusCode;
	private String statusText;
	private JsonNode body;

	private Optional<UnirestParsingException> parseException;
}