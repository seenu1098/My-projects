package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.ApplicationPermissions;

public interface ApplicationPermissionsRepository extends JpaRepository<ApplicationPermissions, UUID> {

	@Query("select count(c) from ApplicationPermissions c where  c.application.id = :applicationId and c.activeFlag = :activeFlag and c.tenantId=:tenantId")
	public int checkApplicationSecurityExist(@Param("applicationId") UUID appId, @Param("activeFlag") String flag, @Param("tenantId") String tenantId);

	public List<ApplicationPermissions> findByApplicationIdAndTenantIdIgnoreCaseAndActiveFlag(UUID pageId, String tenantId, String activeFlag);
}
