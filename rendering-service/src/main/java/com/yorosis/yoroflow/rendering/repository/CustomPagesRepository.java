package com.yorosis.yoroflow.rendering.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroapps.entities.CustomPage;

public interface CustomPagesRepository extends JpaRepository<CustomPage, UUID> {

	public CustomPage findByPageIdAndTenantId(String pageId, String tenantId);
}
