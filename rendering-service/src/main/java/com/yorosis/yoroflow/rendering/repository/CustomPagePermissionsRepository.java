package com.yorosis.yoroflow.rendering.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.CustomPagePermissions;

public interface CustomPagePermissionsRepository extends JpaRepository<CustomPagePermissions, UUID> {

	@Query("select count(c) from CustomPagePermissions c where  c.customPage.id = :pageId and c.activeFlag = :activeFlag and c.tenantId = :tenantId")
	public int checkPageSecurityExist(@Param("pageId") UUID customPageId, @Param("activeFlag") String flag,
			@Param("tenantId") String tenantId);
	
	public List<CustomPagePermissions> findByCustomPageIdAndTenantIdIgnoreCaseAndActiveFlag(UUID pageId, String tenantId,
			String activeFlag);
}
