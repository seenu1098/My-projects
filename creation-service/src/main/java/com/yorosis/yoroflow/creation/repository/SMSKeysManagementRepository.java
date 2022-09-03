package com.yorosis.yoroflow.creation.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroapps.entities.SMSKeys;

public interface SMSKeysManagementRepository extends JpaRepository<SMSKeys, UUID> {

	@Query("select u from SMSKeys u where u.id=:id and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public SMSKeys getOrganizationSMSKey(@Param("id") UUID id, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select u from SMSKeys u where u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<SMSKeys> getSMSKeys(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select u from SMSKeys u where u.providerName=:providerName and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<SMSKeys> getSMSKeysBasedOnProviderName(@Param("providerName") String providerName, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);
}
