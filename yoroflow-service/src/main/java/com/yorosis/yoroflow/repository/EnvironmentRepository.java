package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.EnvironmentVariable;

public interface EnvironmentRepository extends JpaRepository<EnvironmentVariable, UUID> {

	public List<EnvironmentVariable> findByTenantIdAndActiveFlag(String tenantId, String activeFlag);

	public EnvironmentVariable findByNameAndTenantIdAndActiveFlagIgnoreCase(String name, String tenantId, String activeFlag);

	@Query("select p from EnvironmentVariable p where p.processDefinition.processDefinitionId=:processDefinitionId and p.tenantId = :tenantId and p.activeFlag=:activeFlag")
	public List<EnvironmentVariable> getListBasedonProcessDefinitionIdAndTenantIdAndActiveFlag(@Param("processDefinitionId") UUID processDefinitionId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select p from EnvironmentVariable p where p.id=:id and p.tenantId = :tenantId and p.activeFlag=:activeFlag")
	public EnvironmentVariable getListBasedonIdAndTenantIdAndActiveFlag(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select p from EnvironmentVariable p where p.processDefinition.processDefinitionId=:processDefinitionId and p.name =:name and p.tenantId = :tenantId and p.activeFlag=:activeFlag")
	public EnvironmentVariable variableBasedonProcessDefinitionIdAndName(@Param("processDefinitionId") UUID processDefinitionId, @Param("name") String name,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

}
