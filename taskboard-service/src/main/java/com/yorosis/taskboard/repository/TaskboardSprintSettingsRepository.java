package com.yorosis.taskboard.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.TaskboardSprintSettings;

public interface TaskboardSprintSettingsRepository extends JpaRepository<TaskboardSprintSettings, UUID> {

	@Query("select s from TaskboardSprintSettings s where s.sprintSettingId =:sprintSettingId "
			+ " and s.tenantId=:tenantId and s.activeFlag =:activeFlag")
	public TaskboardSprintSettings getTaskboardSprintSettingsById(@Param("sprintSettingId") UUID sprintSettingId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select s from TaskboardSprintSettings s where s.taskboard.id =:taskboardId and s.taskboard.activeFlag =:activeFlag "
			+ " and s.tenantId=:tenantId and s.activeFlag =:activeFlag")
	public TaskboardSprintSettings getTaskboardSprintSettingsByTaskboardId(@Param("taskboardId") UUID taskboardId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select count(s) from TaskboardSprintSettings s where s.taskboard.id =:taskboardId and s.taskboard.activeFlag =:activeFlag "
			+ " and s.tenantId=:tenantId and s.activeFlag =:activeFlag")
	public Integer getTaskboardSprintSettingsCountByTaskboardId(@Param("taskboardId") UUID taskboardId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
