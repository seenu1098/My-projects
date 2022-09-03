package com.yorosis.yoroapps.vo;

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
