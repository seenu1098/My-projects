package com.yorosis.yoroflow.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroflow.entities.OrganizationPrefrences;

public interface OrganizationPrefrencesRepository extends JpaRepository<OrganizationPrefrences, UUID> {

	public OrganizationPrefrences findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String tenantId, String activeFlag);

}
