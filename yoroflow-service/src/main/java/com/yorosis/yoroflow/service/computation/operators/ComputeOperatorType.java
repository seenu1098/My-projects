package com.yorosis.yoroflow.service.computation.operators;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum ComputeOperatorType {

	@JsonProperty("add")
	ADD, @JsonProperty("subtraction")
	SUBTRACT, @JsonProperty("multiplication")
	MULTIPLY, @JsonProperty("division")
	DIVIDE, @JsonProperty("modulo")
	MODULUS, @JsonProperty("between")
	DAYS_BETWEEN

}
