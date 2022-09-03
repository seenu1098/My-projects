package com.yorosis.yoroflow.creation.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroapps.entities.PaymentSettings;

public interface PaymentSettingsRepository extends JpaRepository<PaymentSettings, UUID> {

	public PaymentSettings findByStripeKeyNameAndTenantIdAndActiveFlag(String stripeKey, String tenantId,
			String activeFlag);

	public PaymentSettings findByUuidAndTenantIdAndActiveFlag(UUID uuid, String tenantId, String activeFlag);

}
