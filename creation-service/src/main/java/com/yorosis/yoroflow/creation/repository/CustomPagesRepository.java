package com.yorosis.yoroflow.creation.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroapps.entities.CustomPage;

public interface CustomPagesRepository extends JpaRepository<CustomPage, UUID> {

	public CustomPage findByPageNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String pageName, String tenantId, String activeFlag);

	public CustomPage findByPageIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String pageId, String tenantId, String activeFlag);
}
