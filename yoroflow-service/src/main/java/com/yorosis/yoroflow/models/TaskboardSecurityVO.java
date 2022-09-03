package com.yorosis.yoroflow.models;

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
public class TaskboardSecurityVO {
	private List<String> deletedIDList;
	private List<String> deletedColumnsIDList;
	private List<SecurityListVO> securityList;
	private List<TaskboardColumnSecurityListVO> columnSecurityList;
	private UUID taskboardId;
	private List<UUID> taskboardOwner;
	private Boolean isTaskBoardOwner;
	private List<String> deletedOwnerIdList;
}
