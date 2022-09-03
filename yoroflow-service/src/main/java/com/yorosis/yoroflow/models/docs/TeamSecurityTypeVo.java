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
public class TeamSecurityTypeVo {
	private UUID documentId;
	private String type;
	private List<SecurityVO> securityVOList;
	private List<UUID> deletedTeamsIdList;
}
