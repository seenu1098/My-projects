package com.yorosis.yoroflow.creation.repository;

import java.sql.Date;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.Customers;

public interface CustomersRepository extends JpaRepository<Customers, UUID> {
	public Customers findByActualDomainNameIgnoreCaseAndActiveFlagIgnoreCase(String domain, String activeFlag);

	public Customers findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String tenantId, String activeFlag);

	public Customers findByIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(UUID id, String activeFlag, String tenantId);

	public Customers findByIdAndActiveFlagIgnoreCase(UUID id, String activeFlag);

	public Customers findByAllowedDomainNamesContainingIgnoreCaseAndActiveFlagIgnoreCase(String domain,
			String activeFlag);

	public Customers findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(String subdomainName, String activeFlag);

	@Query("select max(c.customerNumber) from Customers c")
	public int getTotalCustomersCount();

	@Query("select c from Customers c where c.paymentCustomerId=:paymentCustomerId"
			+ " and c.subscriptionStartDate=:subscriptionStartDate and "
			+ "c.subscriptionEndDate=:subscriptionEndDate and c.activeFlag=:activeFlag")
	public Customers getCustomerByPaymentId(@Param("paymentCustomerId") String paymentCustomerId,
			@Param("subscriptionStartDate") Date subscriptionStartDate,
			@Param("subscriptionEndDate") Date subscriptionEndDate, @Param("activeFlag") String activeFlag);

}
