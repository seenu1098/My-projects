package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.InstallableApps;

public interface InstallableAppsRepository extends JpaRepository<InstallableApps, UUID> {
	
	@Query("select i from InstallableApps i where i.activeFlag = :activeFlag and i.tenantId=:tenantId")
	public List<InstallableApps> getAllInstallableApps(@Param("activeFlag") String activeFlag, @Param("tenantId") String tenantId);

	@Query("select i from InstallableApps i where i.id =:id and i.activeFlag = :activeFlag and i.tenantId=:tenantId")
	public InstallableApps getInstallableAppsById(@Param("id") UUID id, @Param("activeFlag") String activeFlag, @Param("tenantId") String tenantId);
}
