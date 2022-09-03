package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.OrganizationDiscount;

public interface OrganizationDiscountRepository extends JpaRepository<OrganizationDiscount, UUID> {

	@Query("select u from OrganizationDiscount u where u.id = :id and customer.id = :customerId and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public OrganizationDiscount getBasedonIdAndTenantIdAndActiveFlag(@Param("id") UUID id,
			@Param("customerId") UUID customerId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from OrganizationDiscount u where u.customer.id = :customerId and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<OrganizationDiscount> getListBasedonCustomerIdAndTenantIdAndActiveFlag(
			@Param("customerId") UUID customerId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from OrganizationDiscount u where u.customer.tenantId = :customertenantId and u.planId.id = :planName and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public OrganizationDiscount getBasedonIdAndTypeAndTenantIdAndActiveFlag(
			@Param("customertenantId") String customertenantId, @Param("tenantId") String tenantId,
			@Param("planName") UUID planName, @Param("activeFlag") String activeFlag);

}
