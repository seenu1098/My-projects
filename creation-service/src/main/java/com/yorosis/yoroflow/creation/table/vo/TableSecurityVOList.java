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
public class TableSecurityVOList {
	private UUID tableId;
	private List<TableSecurityVO> securityTeamVOList;
	private List<UUID> deletedTeamsIdList;
	private List<UUID> tableOwnersId;
	private List<UUID> deletedOwnerIdList;
	private Boolean readAllowed;
	private Boolean updateAllowed;
	private Boolean deleteAllowed;
	private Boolean owner;
	private String tableName;
}
