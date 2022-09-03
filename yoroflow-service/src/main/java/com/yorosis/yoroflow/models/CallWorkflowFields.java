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
public class CallWorkflowFields {
	private String fieldName;
	private String fieldValue;
	private String dataType;
	private VariableType variableType;

}
