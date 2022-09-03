package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.UserOTPRecoveryCodes;

public interface UserOTPRecoveryCodesRepository extends JpaRepository<UserOTPRecoveryCodes, UUID> {

	@Query("select u from UserOTPRecoveryCodes u where  u.recoveryCodes = :recoveryCodes and u.tenantId = :tenantId and u.activeFlag = :activeFlag and u.userId = :userId")
	public UserOTPRecoveryCodes getRecoveryCode(@Param("recoveryCodes") String recoveryCodes, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("userId") UUID userId);

	public List<UserOTPRecoveryCodes> findByUserIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID userId, String tenantId, String activeFlag);

}
