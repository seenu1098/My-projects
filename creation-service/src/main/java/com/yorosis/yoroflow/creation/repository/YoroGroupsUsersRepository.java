package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.Users;
import com.yorosis.yoroapps.entities.YoroGroupsUsers;

public interface YoroGroupsUsersRepository extends JpaRepository<YoroGroupsUsers, UUID> {
	@Query("select ygu from YoroGroupsUsers ygu where ygu.yoroGroups.id = :groupId and ygu.tenantId = :tenantId and ygu.activeFlag = :activeFlag and ygu.users.userName = :userName")
	public List<YoroGroupsUsers> getByGroupIdAndUsernameAndTenantIdAndActiveFlagIgnoreCase(@Param("groupId") UUID groupId, @Param("userName") String userName,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, Pageable request);

	@Query("select ygu.users.userId from YoroGroupsUsers ygu where ygu.yoroGroups.id = :groupId and ygu.tenantId = :tenantId and ygu.activeFlag = :activeFlag")
	public List<Long> getUserIdList(@Param("groupId") UUID groupId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Transactional
	@Modifying
	@Query("delete from YoroGroupsUsers ygu where  ygu.yoroGroups.id = :groupId and ygu.tenantId = :tenantId and ygu.activeFlag = :activeFlag")
	public int deleteYoroGroupUsers(@Param("groupId") UUID groupId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select p from YoroGroupsUsers p where p.users.userId = :userId and p.tenantId = :tenantId and p.activeFlag = :activeFlag")
	public List<YoroGroupsUsers> getGroupList(@Param("userId") UUID userId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select ygu from YoroGroupsUsers ygu where ygu.yoroGroups.id = :groupId and ygu.users.userId = :userId and ygu.tenantId = :tenantId and ygu.activeFlag = :activeFlag")
	public List<YoroGroupsUsers> checkGroupExist(@Param("groupId") UUID groupId, @Param("userId") UUID userId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select ygu from YoroGroupsUsers ygu where ygu.yoroGroups.id = :groupId and ygu.users.userId = :userId and ygu.tenantId = :tenantId and ygu.activeFlag = :activeFlag")
	public YoroGroupsUsers findByUserIdandGroupId(@Param("groupId") UUID groupId, @Param("userId") UUID userId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);
	
	@Query("select ygu.users from YoroGroupsUsers ygu where ygu.yoroGroups.id in :groupId and ygu.tenantId = :tenantId and ygu.activeFlag = :activeFlag")
	public List<Users> getUsers(@Param("groupId") List<UUID> groupId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);


}