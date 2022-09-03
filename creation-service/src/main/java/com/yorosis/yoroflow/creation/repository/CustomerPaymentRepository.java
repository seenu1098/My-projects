package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.yorosis.yoroapps.entities.CustomerPayment;

import feign.Param;

public interface CustomerPaymentRepository extends JpaRepository<CustomerPayment, UUID> {

	public List<CustomerPayment> findByPaymentCustomerIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
			String paymentCustomerId, String tenantId, String activeFlag);

	public List<CustomerPayment> findByPaymentCustomerIdAndTenantIdIgnoreCase(String paymentCustomerId,
			String tenantId);

	public CustomerPayment findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id, String tenantId,
			String activeFlag);

	public CustomerPayment findByPaymentCustomerIdAndIsPaymentSucceedIgnoreCaseAndAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
			String paymentCustomerId, String isPaymentSucceed, String tenantId, String activeFlag);

	@Query("SELECT SUM(c.quantity) FROM CustomerPayment c where c.paymentCustomerId=:paymentCustomerId and c.tenantId=:tenantId and c.activeFlag=:activeFlag")
	public Long getTotalQuantity(@Param("paymentCustomerId") String paymentCustomerId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
