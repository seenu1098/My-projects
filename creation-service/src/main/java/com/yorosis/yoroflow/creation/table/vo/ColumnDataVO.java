package com.yorosis.yoroflow.creation.table.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ColumnDataVO {
	private String columnIdentifier;
	private String columnValue;
	private String dataType;
}
