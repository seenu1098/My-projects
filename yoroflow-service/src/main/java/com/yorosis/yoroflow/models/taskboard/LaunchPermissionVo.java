package com.yorosis.yoroflow.models.taskboard;

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
public class LaunchPermissionVo {
	private UUID taskboardId;
	private Boolean allowLoggedInUser;
	private Boolean allowTaskboardUser;
	private Boolean allowTaskboardTeams;
	private Boolean allowWorkspaceUsers;
	private List<UUID> allowUsersList;
	private List<UUID> allowTeamsList;
}
