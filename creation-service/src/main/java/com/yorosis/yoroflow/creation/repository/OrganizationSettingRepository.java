package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.OrganizationSettings;

public interface OrganizationSettingRepository extends JpaRepository<OrganizationSettings, UUID> {

	@Query("select u from OrganizationSettings u where u.id in :uuidList and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<OrganizationSettings> getListBasedonIdAndTenantIdAndActiveFlag(@Param("uuidList") List<UUID> uuidList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select u from OrganizationSettings u where u.id = :id and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public OrganizationSettings getBasedonIdAndTenantIdAndActiveFlag(@Param("id") UUID id,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select u from OrganizationSettings u where u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<OrganizationSettings> getListTenantIdAndActiveFlag(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

}
