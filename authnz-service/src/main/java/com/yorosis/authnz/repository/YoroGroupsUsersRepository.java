package com.yorosis.authnz.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.yorosis.yoroapps.entities.YoroGroupsUsers;

@Repository
public interface YoroGroupsUsersRepository extends JpaRepository<YoroGroupsUsers, UUID> {

	@Query("select count(u) from YoroGroupsUsers u where u.tenantId = :tenantId and u.activeFlag=:activeFlag and u.users.userId =:userId and u.yoroGroups.id =:groupId")
	public int getYoroGroupsUsersBasedOnUserAndGroupId(@Param("groupId") UUID groupId,
			@Param("userId") UUID userId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

}
