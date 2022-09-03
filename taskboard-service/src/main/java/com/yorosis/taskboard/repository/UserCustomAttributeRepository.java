package com.yorosis.taskboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.UserCustomAttributes;

public interface UserCustomAttributeRepository extends JpaRepository<UserCustomAttributes, UUID> {

	@Query("select u from UserCustomAttributes u where u.user.userId =:id and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<UserCustomAttributes> getListBasedonUserNameAndTenantIdAndActiveFlag(@Param("id") UUID id,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select u from UserCustomAttributes u where u.user.userId =:id and u.name = :name and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public UserCustomAttributes getAttributeBasedonUserNameAndAttributeName(@Param("id") UUID id,
			@Param("name") String name, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select count(u) from UserCustomAttributes u where u.user.userId =:id and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public int getListForUserCustomAttributes(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);
}
