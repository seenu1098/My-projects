package com.yorosis.taskboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yorosis.taskboard.taskboard.entities.TaskboardTemplates;

public interface TaskboardTemplatesRepository extends JpaRepository<TaskboardTemplates, UUID> {
	public List<TaskboardTemplates> findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String tenantId, String activeflag);
}
