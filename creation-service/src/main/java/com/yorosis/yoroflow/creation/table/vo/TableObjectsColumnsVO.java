package com.yorosis.yoroflow.creation.table.vo;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableObjectsColumnsVO {
	private UUID id;
	private String columnIdentifier;
	private String columnName;
	private String dataType;
	private Long fieldSize;
	private Boolean isUnique;
	private Boolean isRequired;
}
