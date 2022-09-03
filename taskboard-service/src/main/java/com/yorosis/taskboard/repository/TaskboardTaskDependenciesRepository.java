package com.yorosis.taskboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.TaskboardTask;
import com.yorosis.taskboard.taskboard.entities.TaskboardTaskDependencies;

public interface TaskboardTaskDependenciesRepository extends JpaRepository<TaskboardTaskDependencies, UUID> {

	@Query("select p from TaskboardTaskDependencies p where p.taskboardTask.id = :id and p.tenantId=:tenantId and p.activeFlag=:activeFlag")
	public List<TaskboardTaskDependencies> getDependenciesByTaskId(UUID id, String tenantId, String activeFlag);

	@Query("select p from TaskboardTaskDependencies p where p.id in :id and p.tenantId=:tenantId and p.activeFlag=:activeFlag")
	public List<TaskboardTaskDependencies> getTaskDependenciesById(@Param("id") List<UUID> id,
			@Param("tenantId") String tenentId, @Param("activeFlag") String activeFlag);

	public TaskboardTaskDependencies findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id, String tenantId,
			String activeFlag);

	@Query("select p from TaskboardTaskDependencies p where p.waitingOn.id = :id and p.tenantId=:tenantId and p.activeFlag=:activeFlag")
	public List<TaskboardTaskDependencies> getTaskDependenciesForWaiting(@Param("id") UUID id,
			@Param("tenantId") String tenentId, @Param("activeFlag") String activeFlag);

	@Query("select p from TaskboardTaskDependencies p where p.blocking.id = :id and p.tenantId=:tenantId and p.activeFlag=:activeFlag")
	public List<TaskboardTaskDependencies> getTaskDependenciesForBlocking(@Param("id") UUID id,
			@Param("tenantId") String tenentId, @Param("activeFlag") String activeFlag);

	@Query("select p from TaskboardTaskDependencies p where p.taskboardTask in :taskboardTask and p.tenantId=:tenantId and p.activeFlag=:activeFlag")
	public List<TaskboardTaskDependencies> getTaskDependenciesForBlockingForTaskBoard(
			@Param("taskboardTask") List<TaskboardTask> taskboardTask, @Param("tenantId") String tenentId,
			@Param("activeFlag") String activeFlag);

	@Query("select p from TaskboardTaskDependencies p where p.relatedTask.id = :id and p.tenantId=:tenantId and p.activeFlag=:activeFlag")
	public List<TaskboardTaskDependencies> getTaskDependenciesForRelatedTask(@Param("id") UUID id,
			@Param("tenantId") String tenentId, @Param("activeFlag") String activeFlag);
}
