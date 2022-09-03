package com.yorosis.yoroflow.models.decision;

import com.yorosis.yoroflow.services.VariableType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Values {

	private String value;
	private String variableName;
	private VariableType variableType;

}