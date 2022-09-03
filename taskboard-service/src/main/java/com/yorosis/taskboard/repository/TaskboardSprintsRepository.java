package com.yorosis.taskboard.repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.TaskboardSprints;

public interface TaskboardSprintsRepository extends JpaRepository<TaskboardSprints, UUID> {

	@Query("select s from TaskboardSprints s where s.sprintId =:sprintId "
			+ " and s.tenantId=:tenantId and s.activeFlag =:activeFlag")
	public TaskboardSprints getTaskboardSprintsById(@Param("sprintId") UUID sprintId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select count(s) from TaskboardSprints s where s.sprintId =:sprintId and s.sprintStatus = 'r' "
			+ " and s.tenantId=:tenantId and s.activeFlag =:activeFlag")
	public int checkStartTaskboardSprintsById(@Param("sprintId") UUID sprintId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select s from TaskboardSprints s where s.taskboardSprintSettings.taskboard.id =:taskboardId and s.taskboardSprintSettings.taskboard.activeFlag =:activeFlag"
			+ " and s.tenantId=:tenantId and s.activeFlag =:activeFlag order by s.sprintSeqNumber asc")
	public List<TaskboardSprints> getTaskboardSprintsListByTaskboard(@Param("taskboardId") UUID taskboardId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select s from TaskboardSprints s where s.taskboardSprintSettings.taskboard.id =:taskboardId and s.taskboardSprintSettings.taskboard.activeFlag =:activeFlag"
			+ " and s.tenantId=:tenantId and s.activeFlag =:activeFlag and s.sprintStatus = 'p' order by s.sprintStartDate asc")
	public List<TaskboardSprints> getTaskboardSprintsInPreparationListByTaskboard(
			@Param("taskboardId") UUID taskboardId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select s from TaskboardSprints s where s.taskboardSprintSettings.sprintSettingId =:sprintSettingId and s.taskboardSprintSettings.activeFlag =:activeFlag"
			+ " and s.tenantId=:tenantId and s.activeFlag =:activeFlag order by s.sprintSeqNumber asc")
	public List<TaskboardSprints> getTaskboardSprintsListBySprintSettings(
			@Param("sprintSettingId") UUID sprintSettingId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select s from TaskboardSprints s where s.taskboardSprintSettings.sprintSettingId =:sprintSettingId and s.taskboardSprintSettings.activeFlag =:activeFlag"
			+ " and s.tenantId=:tenantId and s.activeFlag =:activeFlag and s.sprintStatus = 'p' order by s.sprintStartDate asc")
	public List<TaskboardSprints> getTaskboardSprintsInPreparationListBySprintSettings(
			@Param("sprintSettingId") UUID sprintSettingId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select count(s) from TaskboardSprints s where s.taskboardSprintSettings.sprintSettingId =:sprintSettingId"
			+ " and s.taskboardSprintSettings.activeFlag =:activeFlag"
			+ " and s.tenantId=:tenantId and s.activeFlag =:activeFlag")
	public int getTaskboardSprintsCountByTaskboard(@Param("sprintSettingId") UUID sprintSettingId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select count(s) from TaskboardSprints s where s.taskboardSprintSettings.sprintSettingId =:sprintSettingId"
			+ " and s.taskboardSprintSettings.activeFlag =:activeFlag"
			+ " and ((s.sprintStartDate between :startDate and :endDate)"
			+ " or (s.sprintEndDate between :startDate and :endDate))"
			+ " and s.tenantId=:tenantId and s.activeFlag =:activeFlag")
	public int getTaskboardSprintsCountByStartAndEndDate(@Param("sprintSettingId") UUID sprintSettingId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query("select s from TaskboardSprints s where s.taskboardSprintSettings.taskboard.id =:taskboardId"
			+ " and s.sprintStatus = 'r' and s.tenantId=:tenantId and s.activeFlag =:activeFlag order by s.sprintStartDate asc")
	public List<TaskboardSprints> getTaskboardSprintsListByTaskboardAndRunning(@Param("taskboardId") UUID taskboardId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);
}
