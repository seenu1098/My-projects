package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.yoroflow.entities.TaskboardTemplates;

public interface TaskboardTemplatesRepository extends JpaRepository<TaskboardTemplates, UUID> {
	public List<TaskboardTemplates> findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String tenantId, String activeflag);
}
