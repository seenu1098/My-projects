package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.OrgSubscription;

public interface OrgSubscriptionRepository extends JpaRepository<OrgSubscription, UUID> {

	@Query("select u from OrgSubscription u where u.id=:id and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public OrgSubscription getOrgSubscriptionBasedOnId(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select u from OrgSubscription u where u.customerId=:customerId and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public List<OrgSubscription> getOrgSubscriptionBasedOnCustomerId(@Param("customerId") UUID customerId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
