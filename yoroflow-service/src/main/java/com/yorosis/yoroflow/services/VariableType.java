package com.yorosis.yoroflow.services;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum VariableType {

	@JsonProperty("pagefield")
	PAGEFIELD, @JsonProperty("constant")
	CONSTANT, @JsonProperty("systemVariable")
	SYSTEM_VARIABLE, @JsonProperty("environmentVariable")
	ENVIRONMENT_VARIABLE

}
