
package com.yorosis.yoroflow.rendering.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.Application;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {
	public Application findByAppNameIgnoreCaseAndActiveFlagIgnoreCaseAndTenantId(String applicationName,
			String activeFlag, String tenantId);

	public Application findByApplicationIdIgnoreCaseAndActiveFlagIgnoreCaseAndTenantId(String applicationId,
			String activeFlag, String tenantId);

	public Application findByIdAndActiveFlagIgnoreCaseAndTenantId(UUID id, String activeFlag, String tenantId);

	public Application findByTenantIdAndAppPrefixIgnoreCaseAndActiveFlagIgnoreCase(String tenantId, String appPrefix,
			String activeFlag);

	@Query("select p from Application p where p.workspaceId =:workspaceId and p.tenantId=:tenantId and p.activeFlag=:activeFlag")
	public List<Application> getApplicationTenantIdAndActiveFlag(String tenantId, String activeFlag , @Param("workspaceId") UUID workspaceId);

//	@Query("select p.application from ApplicationPermissions p where p.yoroGroups.id in :id  and p.tenantId=:tenantId and p.activeFlag=:activeFlag")
//	public List<Application> getApplicationIdList(@Param("id") List<UUID> id, @Param("tenantId") String tenantId,
//			@Param("activeFlag") String flag);

	@Query("select p from Application p where p.workspaceId =:workspaceId and p.tenantId=:tenantId and p.activeFlag=:activeFlag and p.managedFlag=:managedFlag")
	public List<Application> getApplicationIdList(@Param("tenantId") String tenantId, @Param("activeFlag") String flag,
			@Param("managedFlag") String managedFlag, @Param("workspaceId") UUID workspaceId);

	@Query("select count(a) from Application a where a.workspaceId =:workspaceId and a.tenantId=:tenantId and a.activeFlag=:activeFlag")
	public int getApplicationCount(@Param("tenantId") String id, @Param("activeFlag") String activeFlag, @Param("workspaceId") UUID workspaceId);

}
