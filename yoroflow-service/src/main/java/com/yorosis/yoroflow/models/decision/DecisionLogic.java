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
public class DecisionLogic {

	private List<Rule> rules;
	private String logicOperator;

}
