package com.yorosis.taskboard.repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.TaskboardSprintWorkLog;

public interface TaskboardSprintWorkLogRepository extends JpaRepository<TaskboardSprintWorkLog, UUID> {

	@Query("select s from TaskboardSprintWorkLog s where s.taskboardSprintTask.sprintTaskId =:taskId and "
			+ "s.taskboardSprintTask.activeFlag =:activeFlag"
			+ " and s.tenantId=:tenantId and s.activeFlag =:activeFlag")
	public List<TaskboardSprintWorkLog> getTaskboardSprintWorkLogByTaskId(@Param("taskId") UUID taskId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, Pageable pageable);

	@Query("select count(s) from TaskboardSprintWorkLog s where s.taskboardSprintTask.sprintTaskId =:taskId and "
			+ "s.taskboardSprintTask.activeFlag =:activeFlag"
			+ " and s.tenantId=:tenantId and s.activeFlag =:activeFlag")
	public Integer getTaskboardSprintWorkLogCountByTaskId(@Param("taskId") UUID taskId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select s from TaskboardSprintWorkLog s where s.workLogId =:workLogId "
			+ " and s.tenantId=:tenantId and s.activeFlag =:activeFlag")
	public TaskboardSprintWorkLog getTaskboardSprintWorkLogById(@Param("workLogId") UUID workLogId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select s from TaskboardSprintWorkLog s where s.taskboardSprintTask.sprintTaskId in :sprintTaskIdList and "
			+ "s.workDate between :startDate and :endDate and s.tenantId=:tenantId and "
			+ "s.activeFlag =:activeFlag order by s.workDate asc")
	public List<TaskboardSprintWorkLog> getTaskboardSprintWorkLogByStartAndEndDate(
			@Param("sprintTaskIdList") List<UUID> sprintTaskIdList, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);
}
