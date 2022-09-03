package com.yorosis.yoroflow.models.decision;

import com.yorosis.yoroflow.services.ValueType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResolvedDecisionConditions {
	private String name;
	private String variableName;
	private ValueType variableType;
	private String dataType;
	private String operator;
}
