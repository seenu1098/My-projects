package com.yorosis.yoroflow.creation.table.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ListOfMapVO {
	private String fieldName;
	private String value;
	private String variableType;
	private String dataType;
}
