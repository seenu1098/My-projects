package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.WorkSpace;

public interface WorkspaceRepository extends JpaRepository<WorkSpace, UUID> {

	@Query("select u from WorkSpace u where u.id = :id and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public WorkSpace getBasedonIdAndTenantIdAndActiveFlag(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from WorkSpace u where u.tenantId = :tenantId and u.activeFlag=:activeFlag and u.archiveWorkspace = 'N' and "
			+ "(u.securedWorkspaceFlag = 'N' or exists (select ws from WorkspaceSecurity ws where ws.workspace.id = u.id and (ws.users.userId =:userId or ws.yoroGroups.id in :groupIdList))) order by u.workspaceName asc")
	public List<WorkSpace> getListBasedonTenantIdAndActiveFlag(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList);

	@Query("select u from WorkSpace u where u.archiveWorkspace = 'N' and u.tenantId = :tenantId and u.activeFlag=:activeFlag"
			+ " order by u.workspaceName asc")
	public List<WorkSpace> getAllListBasedonTenantIdAndActiveFlag(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select count(p) from WorkSpace p where p.workspaceName=:name and p.tenantId = :tenantId and p.activeFlag=:activeFlag")
	public int getWorkspaceName(@Param("name") String name, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select p from WorkSpace p where p.id=:id and p.securedWorkspaceFlag = 'N' and p.tenantId = :tenantId and p.activeFlag=:activeFlag")
	public WorkSpace checkDefaultWorkspace(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from WorkSpace u where u.tenantId = :tenantId and u.activeFlag=:activeFlag and "
			+ "exists (select us from Users us where us.defaultWorkspace = u.id and us.userId =:userId and us.activeFlag=:activeFlag and us.tenantId=:tenantId)")
	public WorkSpace getDefaultWorkspace(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("userId") UUID userId);

	@Query("select p from WorkSpace p where p.workspaceUniqueId=:key and p.tenantId = :tenantId and p.activeFlag=:activeFlag")
	public List<WorkSpace> getWorkspaceByKey(@Param("key") String key, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select count(p) from WorkSpace p where p.workspaceUniqueId=:key and p.tenantId = :tenantId and p.activeFlag=:activeFlag")
	public int checkWorkspaceByUniqueKey(@Param("key") String key, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from WorkSpace u where u.tenantId = :tenantId and u.activeFlag=:activeFlag and u.defaultWorkspace =:activeFlag")
	public WorkSpace getDefaultWorkspaceNotExists(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select count(u) from WorkSpace u where u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public Long totalWorkspaceCount(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select u from WorkSpace u where u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<WorkSpace> getWorkspaceList(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select u from WorkSpace u where u.id not in :workspaceIdList and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<WorkSpace> workspaceToInactivate(@Param("workspaceIdList") List<UUID> workspaceIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

}
