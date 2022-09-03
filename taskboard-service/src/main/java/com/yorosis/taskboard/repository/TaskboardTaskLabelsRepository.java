package com.yorosis.taskboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.TaskboardTask;
import com.yorosis.taskboard.taskboard.entities.TaskboardTaskLabels;

public interface TaskboardTaskLabelsRepository extends JpaRepository<TaskboardTaskLabels, UUID> {

	@Query("select p from TaskboardTaskLabels p where p.taskboardTask.id=:id and p.tenantId=:tenantId and p.activeFlag=:activeFlag ")
	public List<TaskboardTaskLabels> getTaskboardTaskLabels(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	public TaskboardTaskLabels findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id, String tenantId,
			String activeFlag);

	@Query("select p from TaskboardTaskLabels p where p.id in :id and p.tenantId=:tenantId and p.activeFlag=:activeFlag ")
	public List<TaskboardTaskLabels> getTaskLabels(@Param("id") List<UUID> id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select p.taskboardTask from TaskboardTaskLabels p where p.taskboardLabels.id=:id and p.taskboardLabels.tenantId=:tenantId and p.taskboardLabels.activeFlag=:activeFlag"
			+ " and p.tenantId=:tenantId and p.activeFlag=:activeFlag ")
	public List<TaskboardTask> getTaskboardTaskByLabels(@Param("id") UUID id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

}
