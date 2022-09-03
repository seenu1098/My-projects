package com.yorosis.taskboard.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.taskboard.taskboard.entities.LicenseValidation;

public interface LicenseValidationRepository extends JpaRepository<LicenseValidation, UUID> {

	public LicenseValidation findByPlanNameAndCategoryAndFeatureNameAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(
			String planName, String category, String featureName, String activeFlag, String tenantId);

}
