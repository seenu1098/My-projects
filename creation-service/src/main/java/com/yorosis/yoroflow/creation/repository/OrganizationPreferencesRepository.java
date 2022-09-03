package com.yorosis.yoroflow.creation.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.OrganizationPreferences;

public interface OrganizationPreferencesRepository extends JpaRepository<OrganizationPreferences, UUID> {

	@Query("select u from OrganizationPreferences u where u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public OrganizationPreferences getDataTenantIdAndActiveFlag(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
