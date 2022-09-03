package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.Application;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {
	public Application findByAppNameIgnoreCaseAndActiveFlagIgnoreCaseAndTenantIdAndManagedFlagIgnoreCase(String applicationName, String activeFlag,
			String tenantId, String managedFlag);

	public Application findByApplicationIdIgnoreCaseAndActiveFlagIgnoreCaseAndTenantIdIgnoreCaseAndManagedFlagIgnoreCase(String applicationId,
			String activeFlag, String tenantId, String managedFlag);

	public Application findByIdAndActiveFlagIgnoreCaseAndTenantIdAndManagedFlagIgnoreCase(UUID id, String activeFlag, String tenantId, String managedFlag);

	public Application findByTenantIdAndAppPrefixIgnoreCaseAndActiveFlagIgnoreCaseAndManagedFlagIgnoreCase(String tenantId, String appPrefix, String activeFlag,
			String managedFlag);

	@Query("select a from Application a where a.workspaceId =:workspaceId and a.tenantId=:tenantId and a.activeFlag=:activeFlag and a.managedFlag =:managedFlag")
	public List<Application> getApplicationTenantIdAndActiveFlagAndManagedFlagIgnoreCase(String tenantId, String activeFlag, String managedFlag, @Param("workspaceId") UUID workspaceId);

	@Query("select count(a) from Application a where a.workspaceId =:workspaceId and a.tenantId=:tenantId and a.activeFlag=:activeFlag and a.managedFlag =:managedFlag")
	public int getApplicationCount(@Param("tenantId") String id, @Param("activeFlag") String flag, @Param("managedFlag") String managedFlag, @Param("workspaceId") UUID workspaceId);

}
