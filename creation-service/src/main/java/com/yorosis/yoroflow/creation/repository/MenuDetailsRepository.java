package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.MenuDetails;

public interface MenuDetailsRepository extends JpaRepository<MenuDetails, UUID> {

	@Query("select c from MenuDetails c where c.id = :id and c.tenantId = :tenantId and c.activeFlag = :activeFlag")
	public MenuDetails getMenuInfo(@Param("id") UUID id, @Param("tenantId") String tenantId, @Param("activeFlag") String flag);

	@Query("select c from MenuDetails c where c.menu.menuId = :id and c.tenantId = :tenantId and c.activeFlag = :activeFlag")
	public List<MenuDetails> getAllMenuDetailsList(@Param("id") UUID menuId, @Param("tenantId") String tenantId, @Param("activeFlag") String flag);

	@Query("select c from MenuDetails c where c.parentMenuId = :parentMenuId and c.tenantId = :tenantId and c.activeFlag = :activeFlag")
	public List<MenuDetails> getParentMenuList(@Param("parentMenuId") UUID parentMenuId, @Param("tenantId") String tenantId, @Param("activeFlag") String flag);

	@Query("select c from MenuDetails c where c.menuPath = :menuPath and c.tenantId = :tenantId and c.activeFlag = :activeFlag")
	public MenuDetails getMenuInfoMenuPath(@Param("menuPath") String menuPath, @Param("tenantId") String tenantId, @Param("activeFlag") String flag);

	@Query("select c from MenuDetails c where c.reportId = :reportId and c.tenantId = :tenantId")
	public MenuDetails getReportMenuDetails(@Param("reportId") UUID reportId, @Param("tenantId") String tenantId);

}
