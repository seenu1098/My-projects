package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.ErrorProcessInstance;

public interface ErrorProcessInstanceRepository extends JpaRepository<ErrorProcessInstance, UUID> {

	@Query("select u from ErrorProcessInstance u where u.tenantId = :tenantId and u.processInstanceId= :processInstanceId")
	public List<ErrorProcessInstance> getListBasedonTenantIdAndActiveFlag(@Param("processInstanceId") UUID processInstanceId,
			@Param("tenantId") String tenantId);
}
