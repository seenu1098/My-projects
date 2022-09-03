package com.yorosis.yoroflow.models.ws;

import com.yorosis.yoroflow.services.VariableType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class BearerToken {
	private String token;
	private VariableType variableType;
}
