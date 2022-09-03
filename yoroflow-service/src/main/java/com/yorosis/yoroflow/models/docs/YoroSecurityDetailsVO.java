package com.yorosis.yoroflow.models.docs;

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
public class YoroSecurityDetailsVO {
	private UUID documentId;
	private List<SecurityVO> securityVOList;
	private List<UUID> deletedTeamsIdList;
	private List<UUID> yoroDocsOwner;
	private List<UUID> deletedOwnerIdList;
	private boolean readAllowed;
	private boolean updateAllowed;
	private List<UUID> securityUserList;
}
