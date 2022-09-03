package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroflow.entities.OrganizationIntegratedApps;


public interface OrganizationIntegratedAppsRepository extends JpaRepository<OrganizationIntegratedApps, UUID> {
	public List<OrganizationIntegratedApps> findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String tenantId,
			String activeFlag);

	public OrganizationIntegratedApps findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id,
			String tenantId, String activeFlag);
}
