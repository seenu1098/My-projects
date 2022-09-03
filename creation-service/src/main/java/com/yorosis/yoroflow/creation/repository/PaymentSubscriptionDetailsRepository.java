package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.PaymentSubscriptionDetails;

public interface PaymentSubscriptionDetailsRepository extends JpaRepository<PaymentSubscriptionDetails, UUID> {

	@Query("select u from PaymentSubscriptionDetails u where u.customerId=:customerId and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<PaymentSubscriptionDetails> getPaymentSubscriptionDetails(@Param("customerId") UUID customerId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select u from PaymentSubscriptionDetails u where u.planName=:planName and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public PaymentSubscriptionDetails getbyPlanNameAndTenantIdAndActiveFlag(@Param("planName") String planName,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select u from PaymentSubscriptionDetails u where u.id=:id and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public PaymentSubscriptionDetails getbyIdAndPaymentSubscriptionDetails(@Param("id") UUID id,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select u from PaymentSubscriptionDetails u where u.customerId=:customerId and u.planName=:planName and u.activeFlag=:activeFlag")
	public PaymentSubscriptionDetails getbyNameAndPaymentSubscriptionDetails(@Param("customerId") UUID customerId,
			@Param("planName") String planName, @Param("activeFlag") String activeFlag);
}
