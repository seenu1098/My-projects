package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.ProcessDefPrmsn;

public interface ProcessDefinitionPermissionRepository extends JpaRepository<ProcessDefPrmsn, UUID> {

	@Query("select c from ProcessDefPrmsn c where  c.processDefinition.processDefinitionId = :permissionId and c.activeFlag = :activeFlag and c.tenantId = :tenantId")
	public List<ProcessDefPrmsn> checkWorkflowSecurityExist(@Param("permissionId") UUID permissionId, @Param("activeFlag") String flag,
			@Param("tenantId") String tenantId);

	@Query("select c from ProcessDefPrmsn c where  c.processDefinition.processDefinitionId = :processDefinitionId and c.groupId IN :groupId and c.activeFlag = :activeFlag and c.tenantId = :tenantId")
	public List<ProcessDefPrmsn> checkWorkflowSecurityByGroup(@Param("processDefinitionId") UUID processDefinitionId, @Param("groupId") List<UUID> groupId,
			@Param("activeFlag") String flag, @Param("tenantId") String tenantId);

}
