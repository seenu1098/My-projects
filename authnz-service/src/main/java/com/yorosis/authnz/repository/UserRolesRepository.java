package com.yorosis.authnz.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.yorosis.yoroapps.entities.Roles;

@Repository
public interface UserRolesRepository extends JpaRepository<Roles, UUID> {

	@Query("select c from Roles c where c.managedFlag =:managedFlag and c.tenantId = :tenantId and c.activeFlag = :activeFlag")
	public List<Roles> getRolesBasedOnManagedFlag(@Param("tenantId") String tenantId,
			@Param("managedFlag") String managedFlag, @Param("activeFlag") String flag);

	public Roles findByRoleIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID roleId, String tenantId,
			String activeFlag);

	@Query("select c from Roles c where c.tenantId = :tenantId and c.activeFlag = :activeFlag and c.id in :id")
	public List<Roles> getGroupList(@Param("id") List<UUID> id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);
}
