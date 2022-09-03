package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.Workspace;

public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {

	@Query("select u from Workspace u where u.id = :id and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public Workspace getBasedonIdAndTenantIdAndActiveFlag(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);
	
	@Query("select u.id from Workspace u where u.tenantId = :tenantId and u.activeFlag=:activeFlag and u.archiveWorkspace = 'N' and "
			+ "(u.securedWorkspaceFlag = 'N' or exists (select ws from WorkspaceSecurity ws where ws.workspace.id = u.id and (ws.users.userId =:userId or ws.yoroGroups.id in :groupIdList))) order by u.workspaceName asc")
	public List<UUID> getListBasedonTenantIdAndActiveFlag(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList);

}
