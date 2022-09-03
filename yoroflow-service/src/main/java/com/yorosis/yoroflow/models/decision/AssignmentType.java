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
public class AssignmentType {
	private String dataType;
	private VariableType variableType;
	private String variableName;
}
