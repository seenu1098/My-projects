package com.yorosis.yoroflow.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.ProcessDefTaskProperty;

public interface ProcessDefTaskPropertyRepository extends JpaRepository<ProcessDefTaskProperty, UUID> {

	@Query("select p from ProcessDefTaskProperty p where p.processDefinitionTask.taskId= :taskId and p.tenantId = :tenantId")
	public ProcessDefTaskProperty findProcessDefTaskPropertyByTaskProperty(@Param("tenantId") String tenantId, @Param("taskId") UUID taskId);

}
