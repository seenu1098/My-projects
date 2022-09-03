package com.yorosis.authnz.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.CustomPagePermissions;

public interface CustomPagePermissionsRepository extends JpaRepository<CustomPagePermissions, UUID> {

	@Query("select p.customPage.menuPath from CustomPagePermissions p where  p.yoroGroups.id in :id and p.activeFlag = :activeFlag and p.tenantId = :tenantId")
	public List<String> getMenuPath(@Param("id") List<UUID> id, @Param("activeFlag") String flag,
			@Param("tenantId") String tenantId);
}
