package com.yorosis.taskboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.TaskboardLabels;

public interface TaskboardLabelsRepository extends JpaRepository<TaskboardLabels, UUID> {
	public TaskboardLabels findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id, String tenantId,
			String activeFlag);

	@Query("select p from TaskboardLabels p where p.taskboard.id=:id and p.tenantId=:tenantId and p.activeFlag=:activeFlag ")
	public List<TaskboardLabels> getTaskboardLabels(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);
}
