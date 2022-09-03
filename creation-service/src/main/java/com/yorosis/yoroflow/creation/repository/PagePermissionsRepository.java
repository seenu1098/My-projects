package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.PagePermissions;

public interface PagePermissionsRepository extends JpaRepository<PagePermissions, UUID> {

	public List<PagePermissions> findByPageIdAndTenantIdIgnoreCaseAndActiveFlag(UUID pageId, String tenantId, String activeFlag);

	@Query("select count(c) from PagePermissions c where c.tenantId = :tenantId and c.yoroGroups.id = :groupId and c.page.id = :pageId and c.activeFlag = :activeFlag")
	public int checkAccessForYororoups(@Param("tenantId") String tenantId, @Param("groupId") UUID groupId, @Param("pageId") UUID pageId,
			@Param("activeFlag") String flag);

	@Query("select count(c) from PagePermissions c where  c.page.id = :pageId and c.activeFlag = :activeFlag and c.tenantId = :tenantId")
	public int checkPageSecurityExist(@Param("pageId") UUID pageId, @Param("activeFlag") String flag, @Param("tenantId") String tenantId);

	@Query("select c from PagePermissions c where  c.page.id IN :pageId and c.activeFlag = :activeFlag and c.tenantId = :tenantId")
	public List<PagePermissions> getPagePermissionList(@Param("pageId") List<UUID> pageId, @Param("activeFlag") String flag,
			@Param("tenantId") String tenantId);

}
