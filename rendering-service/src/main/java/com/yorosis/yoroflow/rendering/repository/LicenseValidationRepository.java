package com.yorosis.yoroflow.rendering.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroapps.entities.LicenseValidation;

public interface LicenseValidationRepository extends JpaRepository<LicenseValidation, UUID> {

	public LicenseValidation findByPlanNameAndCategoryAndFeatureNameAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(
			String planName, String category, String featureName, String activeFlag, String tenantId);

}
