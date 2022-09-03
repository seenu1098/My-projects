package com.yorosis.yoroapps.vo;

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
public class WorkspaceSecurityVo {
	private UUID workspaceId;
	private List<WorkspaceSecurityNamesVO> assignTeamList;
	private List<UUID> removedTeamList;
	private List<WorkspaceSecurityNamesVO> assignOwnerList;
	private List<UUID> removedOwnerList;
	private Boolean securedWorkspaceFlag;
}
