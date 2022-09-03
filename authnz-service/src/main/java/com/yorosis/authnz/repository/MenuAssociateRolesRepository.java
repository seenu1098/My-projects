package com.yorosis.authnz.repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.MenuAssociateRoles;

public interface MenuAssociateRolesRepository extends JpaRepository<MenuAssociateRoles, UUID> {

	@Query("select p.menuDetails.menuPath from MenuAssociateRoles p where "
			+ "(p.menuDetails.menuPath is not null and p.menuDetails.activeFlag = :activeFlag and p.menuDetails.tenantId = :tenantId) "
			+ "and (p.roles.roleId in :id and p.roles.activeFlag = :activeFlag and p.roles.tenantId = :tenantId) "
			+ "and p.activeFlag = :activeFlag and p.tenantId = :tenantId")
	public Set<String> getMenuPath(@Param("id") List<UUID> id, @Param("activeFlag") String flag,
			@Param("tenantId") String tenantId);

}
