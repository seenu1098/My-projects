package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.UsersWorkflowPin;

public interface UsersWorkflowPinRepository extends JpaRepository<UsersWorkflowPin, UUID> {

	@Query("select u from UsersWorkflowPin u where u.processDefinitionKey = :processDefinitionKey and u.userId = :userId and u.tenantId = :tenantId and u.activeFlag=:activeFlag")
	public UsersWorkflowPin getWorkflowPinByNameAndUserId(@Param("processDefinitionKey") String processDefinitionKey, @Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select u.processDefinitionKey from UsersWorkflowPin u where u.userId = :userId and u.tenantId = :tenantId and u.activeFlag = :activeFlag")
	public List<String> getWorkflowPinListByUserId(@Param("userId") UUID userId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
