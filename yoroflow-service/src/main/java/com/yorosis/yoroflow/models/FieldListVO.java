package com.yorosis.yoroflow.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class FieldListVO {
	private String fieldId;
	private String fieldName;
	private String datatype;
	private String taskType;
	private int order;
	private String value;
}
