package com.yorosis.yoroflow.creation.table.vo;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableObjectsVO {
	private UUID tableObjectId;
	private String tableName;
	private String tableIdentifier;
	private List<TableObjectsColumnsVO> tableObjectsColumns;
	private List<UUID> deletedColumnIDList;
	private Boolean publicTable;
	private String tableDescription;
	private TableSecurityVOList tableSecurityVOList;

}
