package com.yorosis.taskboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.taskboard.taskboard.entities.AppIntegrationEntity;

public interface AppIntegrationRepository extends JpaRepository<AppIntegrationEntity, UUID> {
	public List<AppIntegrationEntity> findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String tenantId,
			String activeFlag);
}
