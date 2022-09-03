package com.yorosis.yoroflow.models.decision;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rule {

	private AssignmentType leftAssignment;
	private String operator;
	private AssignmentType rightAssignment;
	private DecisionLogic decisionLogic;

}
