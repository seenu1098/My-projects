package com.yorosis.authnz.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.OrganizationAzureConfig;

public interface OrgAzureConfigRepository extends JpaRepository<OrganizationAzureConfig, UUID> {

	@Query("select p from OrganizationAzureConfig p where p.authMethods.id = :id and p.activeFlag = :activeFlag and p.tenantId = :tenantId")
	public OrganizationAzureConfig findByIdAndactiveFlag(@Param("id") UUID id, @Param("activeFlag") String flag,
			@Param("tenantId") String tenantId);

}
