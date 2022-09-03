package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.PagePermissions;

public interface PagePermissionsRepository extends JpaRepository<PagePermissions, UUID> {

	@Query("select p.page.pageId from PagePermissions p where  p.yoroGroups.id in :id and p.activeFlag = :activeFlag and p.tenantId = :tenantId")
	public List<String> getMenuPath(@Param("id") List<UUID> id, @Param("activeFlag") String flag, @Param("tenantId") String tenantId);

}
