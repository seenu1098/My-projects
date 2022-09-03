package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.UserCustomAttributes;

public interface UserCustomAttributeRepository extends JpaRepository<UserCustomAttributes, UUID> {

	@Query("select u from UserCustomAttributes u where u.id=:id and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public UserCustomAttributes getListBasedonIdAndTenantIdAndActiveFlag(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from UserCustomAttributes u where u.users.userId =:id and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<UserCustomAttributes> getListBasedonUserNameAndTenantIdAndActiveFlag(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from UserCustomAttributes u where u.name =:name and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<UserCustomAttributes> getListBasedonAttributeNameAndTenantIdAndActiveFlag(@Param("name") String name, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from UserCustomAttributes u where u.name =:name and u.users.userId =:id and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public UserCustomAttributes getListBasedonUserNameAndAttributeNameAndTenantIdAndActiveFlag(@Param("name") String name, @Param("id") UUID id,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
