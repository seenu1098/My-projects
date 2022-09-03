package com.yorosis.taskboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.TaskboardSprintTask;

public interface TaskboardSprintTasksRepository extends JpaRepository<TaskboardSprintTask, UUID> {

	@Query("select s from TaskboardSprintTask s where s.taskboardTask.id =:taskId and s.taskboardTask.activeFlag =:activeFlag"
			+ " and s.taskboardSprint.sprintId =:sprintId and s.taskboardSprint.activeFlag =:activeFlag "
			+ " and s.tenantId=:tenantId and s.activeFlag =:activeFlag")
	public TaskboardSprintTask getTaskboardSprintTasksById(@Param("taskId") UUID taskId,
			@Param("sprintId") UUID sprintId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select s from TaskboardSprintTask s where s.sprintTaskId =:sprintTaskId "
			+ " and s.tenantId=:tenantId and s.activeFlag =:activeFlag")
	public TaskboardSprintTask getTaskboardSprintTasksById(@Param("sprintTaskId") UUID sprintTaskId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select s.taskboardTask.id from TaskboardSprintTask s where s.taskboardSprint.sprintId =:sprintId "
			+ "and s.taskboardSprint.activeFlag =:activeFlag"
			+ " and s.tenantId=:tenantId and s.activeFlag =:activeFlag")
	public List<UUID> getTaskboardSprintTasksBySprintId(@Param("sprintId") UUID sprintId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select s from TaskboardSprintTask s where s.taskboardSprint.sprintId =:sprintId "
			+ "and s.taskboardSprint.activeFlag =:activeFlag"
			+ " and s.tenantId=:tenantId and s.activeFlag =:activeFlag")
	public List<TaskboardSprintTask> getTaskboardSprintTasksListBySprintId(@Param("sprintId") UUID sprintId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select s from TaskboardSprintTask s where s.taskboardTask.id =:taskboardTaskId "
			+ "and s.taskboardTask.id =:activeFlag" + " and s.tenantId=:tenantId and s.activeFlag =:activeFlag")
	public List<TaskboardSprintTask> getTaskboardSprintTasksListByTaskboardId(
			@Param("taskboardTaskId") UUID taskboardTaskId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select sum(s.sprintEstimatedHours) from TaskboardSprintTask s where s.taskboardSprint.sprintId =:sprintId "
			+ "and s.taskboardSprint.activeFlag =:activeFlag"
			+ " and s.tenantId=:tenantId and s.activeFlag =:activeFlag")
	public Long getSumOfEstimatedHours(@Param("sprintId") UUID sprintId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);
}
