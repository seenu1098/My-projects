package com.yorosis.taskboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.Customers;

public interface CustomersRepository extends JpaRepository<Customers, UUID> {
	public Customers findByActualDomainNameIgnoreCaseAndActiveFlagIgnoreCase(String domain, String activeFlag);

	public Customers findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String tenantId, String activeFlag);

	public Customers findByAllowedDomainNamesContainingIgnoreCaseAndActiveFlagIgnoreCase(String domain, String activeFlag);

	public Customers findByIdAndActiveFlagIgnoreCase(Long id, String activeFlag);

	public Customers findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(String domain, String activeFlag);

	@Query("Select c from Customers c where activeFlag='Y'  and customerNumber between :startRange and :endRange")
	public List<Customers> findByActiveFlagIgnoreCaseFromTenantRange(@Param("startRange") int startRange, @Param("endRange") int endRange);

	public List<Customers> findByActiveFlagIgnoreCase(String activeFlag);

	@Query("Select max(customerNumber) from Customers where activeFlag='Y'")
	public int getActiveFlagIgnoreCaseMaxTenantId();

}
