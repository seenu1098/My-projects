package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.UserSignature;

public interface UserSignatureRepository extends JpaRepository<UserSignature, UUID> {

	@Query("select u from UserSignature u where u.id = :id and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public UserSignature getBasedonIdAndTenantIdAndActiveFlag(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from UserSignature u where u.id in :id and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<UserSignature> getListBasedonIdAndTenantIdAndActiveFlag(@Param("id") List<UUID> id,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select u from UserSignature u where u.users.userId = :userId and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<UserSignature> getListBasedonTenantIdAndActiveFlag(@Param("userId") UUID userId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);
	
	@Query("select u from UserSignature u where u.id <> :signatureId and u.users.userId = :userId and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<UserSignature> getListBasedonTenantIdAndActiveFlagNotDefault(@Param("userId") UUID userId, @Param("signatureId") UUID signatureId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

}
