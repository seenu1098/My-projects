package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroflow.entities.Dashboard;

public interface DashboardRepository extends JpaRepository<Dashboard, UUID> {

	public List<Dashboard> findByOwnerUserIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID userId, String tenantId,
			String activeFlag);

	public Dashboard findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id, String tenantId, String activeFlag);

	public List<Dashboard> findByDashboardNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String dashboardName,
			String tenantId, String activeFlag);
}
