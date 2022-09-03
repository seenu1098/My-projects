package com.yorosis.yoroflow.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class FieldVO {
	private String fieldId;
	private String fieldName;
	private String datatype;
	private String dateFormat;
	private String taskType;
	private String repeatableFieldName;
	private String repeatableFieldId;
	private String controlType;
	private UUID ownedByWorkflow;
	private String pageName;
	private int version;
}
