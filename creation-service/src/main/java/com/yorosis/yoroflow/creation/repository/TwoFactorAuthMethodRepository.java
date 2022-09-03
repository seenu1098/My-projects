package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.TwoFactorAuthMethods;

public interface TwoFactorAuthMethodRepository extends JpaRepository<TwoFactorAuthMethods, UUID> {

	@Query("select c from TwoFactorAuthMethods c where c.tenantId = :tenantId and c.activeFlag = :activeFlag")
	public List<TwoFactorAuthMethods> getTwoFactorAuthMethodsList(@Param("activeFlag") String activeFlag, @Param("tenantId") String tenantId);

	@Query("select c from TwoFactorAuthMethods c where c.tenantId = :tenantId")
	public List<TwoFactorAuthMethods> getTwoFactorAuthMethodsListWithoutActiveFlag(@Param("tenantId") String tenantId);
}
