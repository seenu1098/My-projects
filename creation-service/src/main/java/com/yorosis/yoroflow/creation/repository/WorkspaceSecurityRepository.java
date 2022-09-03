package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.WorkspaceSecurity;

public interface WorkspaceSecurityRepository extends JpaRepository<WorkspaceSecurity, UUID> {

	@Query("select u from WorkspaceSecurity u where u.yoroGroups.id in :groupId and u.workspace.id = :workspaceId and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<WorkspaceSecurity> getListBasedonGroupIdAndWorkspaceIdTenantIdAndActiveFlag(
			@Param("groupId") List<UUID> groupId, @Param("workspaceId") UUID workspaceId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
	
	@Query("select u from WorkspaceSecurity u where u.yoroGroups.id is not null and u.workspace.id = :workspaceId and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<WorkspaceSecurity> getGroupIDListBasedonWorkspaceIdTenantIdAndActiveFlag(
			@Param("workspaceId") UUID workspaceId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
	
	@Query("select u from WorkspaceSecurity u where u.users.userId in :userId and u.users.activeFlag=:activeFlag "
			+ "and u.workspace.id = :workspaceId and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<WorkspaceSecurity> getListBasedonUserIdAndWorkspaceIdTenantIdAndActiveFlag(
			@Param("userId") List<UUID> userId, @Param("workspaceId") UUID workspaceId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
	
	@Query("select u from WorkspaceSecurity u where u.users.userId is not null and u.workspace.id = :workspaceId and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<WorkspaceSecurity> getUserIdListBasedonWorkspaceIdTenantIdAndActiveFlag(
			@Param("workspaceId") UUID workspaceId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select u.workspace.id, u.yoroGroups.id, u.yoroGroups.groupName from WorkspaceSecurity u where u.yoroGroups.id is not null and "
			+ " u.tenantId = :tenantId and u.activeFlag=:activeFlag group by u.workspace.id, u.yoroGroups.id, u.yoroGroups.groupName")
	public List<Object[]> getListBasedonWorkspaceIdTenantIdAndActiveFlag(
			@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);
	
	@Query("select u.workspace.id, u.users.userId, u.users.firstName, u.users.lastName from WorkspaceSecurity u where u.users.userId is not null and u.tenantId = :tenantId"
			+ " and u.activeFlag=:activeFlag and u.users.activeFlag=:activeFlag group by u.workspace.id, u.users.userId, u.users.firstName, u.users.lastName")
	public List<Object[]> getOwnerListBasedonWorkspaceIdTenantIdAndActiveFlag(
			 @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);
	
	@Query("select u.yoroGroups.id from WorkspaceSecurity u where u.yoroGroups.id is not null and u.workspace.id = :workspaceId and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<UUID> getGroupIDUUIDListBasedonWorkspaceIdTenantIdAndActiveFlag(
			@Param("workspaceId") UUID workspaceId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

}
