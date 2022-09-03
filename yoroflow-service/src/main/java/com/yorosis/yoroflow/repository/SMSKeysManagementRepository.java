package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.SMSKeys;

public interface SMSKeysManagementRepository extends JpaRepository<SMSKeys, UUID> {
	@Query("select u from SMSKeys u where u.providerName=:providerName and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<SMSKeys> getSMSKeysBasedOnProviderName(@Param("providerName") String providerName, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from SMSKeys u where u.id=:id and u.activeFlag=:activeFlag and u.tenantId=:tenantId")
	public SMSKeys getSMSKeyById(@Param("id") UUID id, @Param("activeFlag") String activeFlag, @Param("tenantId") String tenantId);

}
