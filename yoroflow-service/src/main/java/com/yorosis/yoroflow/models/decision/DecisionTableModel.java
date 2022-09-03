package com.yorosis.yoroflow.models.decision;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DecisionTableModel {
	private boolean restartable;
	private String operator;
	private List<VariableValues> conditionVariableList;
	private List<VariableValues> assignToVariableValuesList;
	private List<DecisionTableConditions> conditions;
	private DecisionTableConditions assignToVariable;
}