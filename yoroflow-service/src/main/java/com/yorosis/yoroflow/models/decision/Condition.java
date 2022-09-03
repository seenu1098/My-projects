package com.yorosis.yoroflow.models.decision;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Condition {
	private String ifTargetTask;
	private String elseTargetTask;
	private DecisionLogic decisionLogic;

}
