package com.yorosis.taskboard.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.OrganizationIntegratedAppsConfig;

public interface OrgIntegratedAppsConfigRepository extends JpaRepository<OrganizationIntegratedAppsConfig, UUID> {

	@Query("select app from OrganizationIntegratedAppsConfig app where app.organizationIntegratedApps.id=:appId and app.tenantId=:tenantId and app.activeFlag=:activeFlag")
	public OrganizationIntegratedAppsConfig getOrgAppsConfigByParentId(@Param("appId") UUID appId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
