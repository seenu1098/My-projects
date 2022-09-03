package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroapps.entities.InstalledApps;

public interface InstalledAppRepository extends JpaRepository<InstalledApps, UUID> {

	public List<InstalledApps> findByTenantIdAndActiveFlagIgnoreCase(String tenantId, String activeFlag);
}