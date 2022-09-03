package com.yorosis.yoroflow.creation.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroapps.entities.Organization;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

	public Organization findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String tenantId, String activeFlag);

	public Organization findByIdAndActiveFlagIgnoreCase(UUID id, String activeFlag);

	public Organization findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(String subdomainName, String activeFlag);

}
