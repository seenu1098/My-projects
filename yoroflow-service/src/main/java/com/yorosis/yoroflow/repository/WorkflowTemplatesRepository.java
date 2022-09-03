package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroflow.entities.WorkflowTemplates;

public interface WorkflowTemplatesRepository extends JpaRepository<WorkflowTemplates, UUID> {
	public List<WorkflowTemplates> findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String tenantId, String activeFlag);
}
