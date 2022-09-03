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
public class DecisionTableConditions {
	private String name;
	private String variableName;
	private VariableType variableType;
	private String dataType;
	private String operator;

}