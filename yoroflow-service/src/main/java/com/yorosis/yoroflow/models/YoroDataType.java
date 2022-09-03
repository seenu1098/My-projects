package com.yorosis.yoroflow.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum YoroDataType {

	@JsonProperty("date")
	DATE,

	@JsonProperty("number")
	NUMBER,

	@JsonProperty("float")
	FLOAT,

	@JsonProperty("string")
	STRING;

}
