package com.yorosis.yoroflow.models;

import com.yorosis.yoroflow.services.VariableType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ComputeRightAssignment {
	private String dataType;
	private VariableType variableType;
	private String variableName;

}
