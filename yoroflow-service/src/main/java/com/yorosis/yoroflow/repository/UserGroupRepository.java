package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.UserGroup;

public interface UserGroupRepository extends JpaRepository<UserGroup, UUID> {
	public List<UserGroup> findByTenantId(String tenantId);

	@Query("select p from UserGroup p where p.group.groupId=:groupId and p.tenantId=:tenantId")
	public List<UserGroup> findByTenantIdAndGroupId(@Param("tenantId") String tenantId, @Param("groupId") UUID groupId);

	@Query("select p from UserGroup p where p.user.userId=:userId and p.tenantId=:tenantId")
	public List<UserGroup> getUserGroup(@Param("userId") UUID userId, @Param("tenantId") String tenantId);

	@Query("select p from UserGroup p where p.user.userId=:userId and p.tenantId=:tenantId and p.activeFlag=:activeFlag")
	public List<UserGroup> getUserGroups(@Param("userId") UUID userId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select ygu from UserGroup ygu where ygu.group.id = :groupId and ygu.tenantId = :tenantId and ygu.activeFlag = :activeFlag and ygu.user.userName = :userName")
	public List<UserGroup> getGroupIdAndUsernameAndTenantIdAndActiveFlagIgnoreCase(@Param("groupId") UUID groupId, @Param("userName") String userName,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, Pageable request);
	
	@Query("select p.user.userId from UserGroup p where p.group.id in :groupId and p.tenantId=:tenantId and p.activeFlag=:activeFlag")
	public Set<UUID> getUserIdByGroupIdList(@Param("groupId") List<UUID> groupId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
