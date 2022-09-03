package com.yorosis.yoroflow.rendering.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroapps.entities.Customers;

public interface CustomersRepository extends JpaRepository<Customers, UUID> {
	public Customers findByActualDomainNameIgnoreCaseAndActiveFlagIgnoreCase(String domain, String activeFlag);
	
	public Customers findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(String domain, String activeFlag);

	public Customers findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String tenantId, String activeFlag);

	public Customers findByAllowedDomainNamesContainingIgnoreCaseAndActiveFlagIgnoreCase(String domain, String activeFlag);

}
