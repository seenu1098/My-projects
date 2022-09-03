package com.yorosis.authnz.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.UserAssociateRoles;

public interface UserAssociateRolesRepository extends JpaRepository<UserAssociateRoles, UUID> {
	@Query("select c from UserAssociateRoles c where c.users.userId = :id and c.tenantId = :tenantId and c.activeFlag = :activeFlag")
	public List<UserAssociateRoles> getRolesBasedOnUserId(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String flag);

	@Query("select c from UserAssociateRoles c where c.users.userId = :id and c.roles.roleId =:roleId and c.tenantId = :tenantId and c.activeFlag = :activeFlag")
	public UserAssociateRoles getRolesBasedOnUserIdAndRole(@Param("id") UUID id, @Param("roleId") UUID roleId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String flag);

	@Query("select c from UserAssociateRoles c where c.users.userId = :id and c.roles.roleId not in :roleId and c.tenantId = :tenantId and c.activeFlag = :activeFlag")
	public List<UserAssociateRoles> getRolesBasedOnUserIdAndNotInRole(@Param("id") UUID id,
			@Param("roleId") List<UUID> roleId, @Param("tenantId") String tenantId, @Param("activeFlag") String flag);

	@Query("select c from UserAssociateRoles c where c.roles.roleId =:roleId and c.tenantId = :tenantId and c.activeFlag = :activeFlag")
	public List<UserAssociateRoles> getRolesBasedOnRoleId(@Param("roleId") UUID roleId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String flag);

	@Transactional
	@Modifying
	@Query("delete from UserAssociateRoles r where  r.roles.roleId = :roleId and r.tenantId = :tenantId and r.activeFlag = :activeFlag")
	public int deleteUserByRoles(@Param("roleId") UUID roleId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select count(u) from UserAssociateRoles u where u.tenantId = :tenantId and u.activeFlag=:activeFlag and u.users.userId =:userId and u.roles.roleId =:roleId")
	public int getUserAssociateRolesBasedOnUserAndRoleId(@Param("roleId") UUID roleId, @Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select c.roles.roleId from UserAssociateRoles c where c.users.userId = :id and c.tenantId = :tenantId and c.activeFlag = :activeFlag")
	public List<UUID> getRolesIdListBasedOnUserId(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String flag);

}
