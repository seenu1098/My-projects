package com.yorosis.authnz.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.yorosis.yoroapps.entities.Organization;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

	public Organization findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String tenantId, String activeFlag);

}
