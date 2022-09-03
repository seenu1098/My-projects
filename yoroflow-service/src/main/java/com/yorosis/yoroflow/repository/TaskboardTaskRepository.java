package com.yorosis.yoroflow.repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.Taskboard;
import com.yorosis.yoroflow.entities.TaskboardTask;
import com.yorosis.yoroflow.models.TaskEntityVO;

public interface TaskboardTaskRepository extends JpaRepository<TaskboardTask, UUID> {
	public TaskboardTask findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id, String tenantId,
			String activeFlag);

	@Query("select p from TaskboardTask p where p.id in :id and p.tenantId =:tenantId and p.activeFlag = :activeFlag")
	public List<TaskboardTask> getTasksById(@Param("id") List<UUID> id, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select p from TaskboardTask p where p.taskboard.workspaceId =:workspaceId and p.taskType = 'parentTask' and p.status not in ('Done', 'done') and p.tenantId =:tenantId and p.activeFlag = :activeFlag")
	public List<TaskboardTask> findByTenantIdIgnoreCaseAndActiveFlagIgnoreCaseWithPagination(
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, Pageable pageable,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p from TaskboardTask p where p.parentTaskId=:parentTaskId and p.tenantId =:tenantId and p.activeFlag = :activeFlag order by p.createdOn asc")
	public List<TaskboardTask> getParentTaskIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
			@Param("parentTaskId") UUID parentTaskId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select count(p) from TaskboardTask p where p.parentTaskId=:parentTaskId and p.tenantId =:tenantId and p.activeFlag = :activeFlag")
	public int getCountByParentTaskIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
			@Param("parentTaskId") UUID parentTaskId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select p from TaskboardTask p where p.taskboard.id=:taskboardId and p.status=:status and p.tenantId =:tenantId and p.activeFlag = :activeFlag")
	public List<TaskboardTask> getTaskboardTasksByStatus(@Param("taskboardId") UUID taskboardId,
			@Param("status") String status, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select p from TaskboardTask p where (p.parentTaskId=:parentTaskId and p.activeFlag = :activeFlag and p.tenantId =:tenantId and "
			+ " exists (select x from TaskboardTaskAssignedUsers x where x.taskboardTask.id = p.id and x.userId=:userId and x.activeFlag=:activeFlag and x.tenantId=:tenantId))")
	public List<TaskboardTask> getSubTasksWithAssignedUsers(@Param("parentTaskId") UUID parentTaskId,
			@Param("userId") UUID userid, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select count(p) from TaskboardTask p where p.taskboard.id=:taskboardId and p.status=:status and p.tenantId =:tenantId and p.activeFlag = :activeFlag")
	public Long getTaskboardTasksByStatusCount(@Param("taskboardId") UUID taskboardId, @Param("status") String status,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select count(p) from TaskboardTask p where p.taskboard.id=:taskboardId and p.taskType = 'parentTask' and p.tenantId =:tenantId and p.activeFlag = :activeFlag")
	public Long getTaskboardTasksCount(@Param("taskboardId") UUID taskboardId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select p from TaskboardTask p where p.taskboard.id=:taskboardId and p.status=:status and p.tenantId =:tenantId and p.activeFlag = :activeFlag order by p.sequenceNo asc")
	public List<TaskboardTask> getTaskboardTasksByStatusList(@Param("taskboardId") UUID taskboardId,
			@Param("status") String status, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select count(p) from taskboard_task p where p.id in :taskId and p.tenant_id =:tenantId and p.active_flag = :activeFlag and"
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order <> (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId)", nativeQuery = true)
	public int checkAllTasksInDone(@Param("taskId") List<UUID> taskId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("taskboardId") UUID taskboardId);

	@Query(value = "select p.task_id from taskboard_task p where p.id in :taskId and p.tenant_id =:tenantId and p.active_flag = :activeFlag and"
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order <> (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId)", nativeQuery = true)
	public List<String> checkAllAndGetTaskIdTasksInDone(@Param("taskId") List<UUID> taskId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("taskboardId") UUID taskboardId);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and p.status not in ('Done', 'done') and p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ " exists (select * from taskboard t where t.id = p.taskboard_id and t.workspace_id =:workspaceId and t.active_flag =:activeFlag) and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ " exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and t.active_flag = :activeFlag) and "
			+ " (case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag) "
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ "  else true end)", nativeQuery = true)
	public List<TaskboardTask> getByTenantIdIgnoreCaseAndActiveFlagIgnoreCaseWithPagination(
			@Param("userId") UUID userid, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, Pageable pageable,
			@Param("workspaceId") UUID workspaceId);

	@Query(value = "select count(p) from taskboard_task p where p.task_type = 'parentTask' and p.status not in ('Done', 'done') and p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ " exists (select * from taskboard t where t.id = p.taskboard_id and t.workspace_id =:workspaceId and t.active_flag =:activeFlag) and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ " exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and t.active_flag = :activeFlag) and "
			+ " (case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag) "
			+ "then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ "  else true end)", nativeQuery = true)
	public int getByTenantIdIgnoreCaseAndActiveFlagIgnoreCaseWithPaginationCount(@Param("userId") UUID userid,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("workspaceId") UUID workspaceId);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and p.due_date between :startDate and :endDate and p.status not in ('Done', 'done') and p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ " exists (select * from taskboard t where t.id = p.taskboard_id and t.workspace_id =:workspaceId and t.active_flag =:activeFlag) and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ " exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and t.active_flag = :activeFlag) and "
			+ " (case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ "  else true end)", nativeQuery = true)
	public List<TaskboardTask> getTaskBasedOnDueDateTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
			@Param("userId") UUID userid, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate, Pageable pageable,
			@Param("workspaceId") UUID workspaceId);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and p.status not in ('Done', 'done') and p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ " exists (select * from taskboard t where t.id = p.taskboard_id and t.workspace_id =:workspaceId and t.active_flag =:activeFlag) and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ " exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and t.active_flag = :activeFlag) and "
			+ " (case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and (x.user_id in :assignedUserId) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ "  else false end)", nativeQuery = true)
	public List<TaskboardTask> getTaskBasedOnTenantIdIgnoreCaseAndActiveFlagIgnoreCaseWithUserFilter(
			@Param("userId") UUID userid, @Param("groupIdList") List<UUID> groupIdList,
			@Param("assignedUserId") List<UUID> assignedUserId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, Pageable pageable, @Param("workspaceId") UUID workspaceId);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and p.status not in ('Done', 'done') and p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ " exists (select * from taskboard t where t.id = p.taskboard_id and t.workspace_id =:workspaceId and t.active_flag =:activeFlag) and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ " exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and t.active_flag = :activeFlag) and "
			+ " (case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag) "
			+ "then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and (x.user_id is null) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else true end) ", nativeQuery = true)
	public List<TaskboardTask> getTaskBasedOnTenantIdIgnoreCaseAndActiveFlagIgnoreCaseUnassigned(
			@Param("userId") UUID userid, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, Pageable pageable,
			@Param("workspaceId") UUID workspaceId);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and p.status not in ('Done', 'done') and p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ " exists (select * from taskboard t where t.id = p.taskboard_id and t.workspace_id =:workspaceId and t.active_flag =:activeFlag) and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ " exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and t.active_flag = :activeFlag) and "
			+ " (case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag) "
			+ "then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and (x.user_id in :assignedUserId or x.user_id is null) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ "  else true end)", nativeQuery = true)
	public List<TaskboardTask> getTaskBasedOnTenantIdIgnoreCaseAndActiveFlagIgnoreCaseUnAssignedAndUser(
			@Param("userId") UUID userid, @Param("groupIdList") List<UUID> groupIdList,
			@Param("assignedUserId") List<UUID> assignedUserId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, Pageable pageable, @Param("workspaceId") UUID workspaceId);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and p.due_date between :startDate and :endDate and p.status not in ('Done', 'done') and p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ " exists (select * from taskboard t where t.id = p.taskboard_id and t.workspace_id =:workspaceId and t.active_flag =:activeFlag) and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ " exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and t.active_flag = :activeFlag) and "
			+ " (case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and (x.user_id in :assignedUserId) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ "  else false end)", nativeQuery = true)
	public List<TaskboardTask> getTaskBasedOnDueDateTenantIdIgnoreCaseAndActiveFlagIgnoreCaseWithUserFilter(
			@Param("userId") UUID userid, @Param("groupIdList") List<UUID> groupIdList,
			@Param("assignedUserId") List<UUID> assignedUserId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate, Pageable pageable, @Param("workspaceId") UUID workspaceId);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and p.due_date between :startDate and :endDate and p.status not in ('Done', 'done') and p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ " exists (select * from taskboard t where t.id = p.taskboard_id and t.workspace_id =:workspaceId and t.active_flag =:activeFlag) and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ " exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and t.active_flag = :activeFlag) and "
			+ " (case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and (x.user_id is null) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else true end) ", nativeQuery = true)
	public List<TaskboardTask> getTaskBasedOnDueDateTenantIdIgnoreCaseAndActiveFlagIgnoreCaseUnassigned(
			@Param("userId") UUID userid, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate, Pageable pageable,
			@Param("workspaceId") UUID workspaceId);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and p.due_date between :startDate and :endDate and p.status not in ('Done', 'done') and p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ " exists (select * from taskboard t where t.id = p.taskboard_id and t.workspace_id =:workspaceId and t.active_flag =:activeFlag) and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ " exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and t.active_flag = :activeFlag) and "
			+ " (case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and (x.user_id in :assignedUserId or x.user_id is null) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ "  else true end)", nativeQuery = true)
	public List<TaskboardTask> getTaskBasedOnDueDateTenantIdIgnoreCaseAndActiveFlagIgnoreCaseUnAssignedAndUser(
			@Param("userId") UUID userid, @Param("groupIdList") List<UUID> groupIdList,
			@Param("assignedUserId") List<UUID> assignedUserId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate, Pageable pageable, @Param("workspaceId") UUID workspaceId);

	@Query(value = "select count(p) from taskboard_task p where p.task_type = 'parentTask' and p.due_date between :startDate and :endDate and p.status not in ('Done', 'done') and p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ " exists (select * from taskboard t where t.id = p.taskboard_id and t.workspace_id =:workspaceId and t.active_flag =:activeFlag) and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ " exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and t.active_flag = :activeFlag) and "
			+ " (case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ "  else true end)", nativeQuery = true)
	public int getTaskBasedOnDueDateTenantIdIgnoreCaseAndActiveFlagIgnoreCaseCount(@Param("userId") UUID userid,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate, @Param("workspaceId") UUID workspaceId);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and p.status not in ('Done', 'done') and p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ " exists (select * from taskboard t where t.id = p.taskboard_id and t.workspace_id =:workspaceId and t.active_flag =:activeFlag) and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ " exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and t.active_flag = :activeFlag) and "
			+ " (case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ "  else true end)", nativeQuery = true)
	public List<TaskboardTask> findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(@Param("userId") UUID userid,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("workspaceId") UUID workspaceId);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and p.created_on between :startDate and :endDate and p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ " exists (select * from taskboard t where t.id = p.taskboard_id and t.workspace_id =:workspaceId and t.active_flag =:activeFlag) and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ " exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and t.active_flag = :activeFlag) and "
			+ " (case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ "  else true end)", nativeQuery = true)
	public List<TaskboardTask> getTaskByTenantIdIgnoreCaseAndActiveFlagIgnoreCaseAndDate(@Param("userId") UUID userid,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate, @Param("workspaceId") UUID workspaceId);

	public List<TaskboardTask> findByTaskboardAndStatusAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(Taskboard taskboard,
			String status, String tenantId, String activeFlag);

	@Query(value = "select * from taskboard_task p where p.taskboard_id = :taskboardId and "
			+ " p.task_type = 'subtask' and p.active_flag = :activeFlag and "
			+ " p.parent_task_id in :parentTaskIdList and p.tenant_id=:tenantId and "
			+ " (case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ "  else true end)", nativeQuery = true)
	public List<TaskboardTask> getTaskBySubTaskWithPermission(@Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("taskboardId") UUID taskboardId,
			@Param("parentTaskIdList") List<UUID> parentTaskIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select * from taskboard_task p where "
			+ " p.task_type = 'subtask' and p.active_flag = :activeFlag and "
			+ " p.parent_task_id = :parentTaskId and p.tenant_id=:tenantId and "
			+ " (case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ "  else true end)", nativeQuery = true)
	public List<TaskboardTask> getTaskBySubTaskWithParentTaskPermission(@Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("parentTaskId") UUID parentTaskId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select * from taskboard_task p where "
			+ " p.task_type = 'subtask' and p.active_flag = :activeFlag and "
			+ " p.parent_task_id = :parentTaskId and p.tenant_id=:tenantId", nativeQuery = true)
	public List<TaskboardTask> getTaskBySubTaskForOwners(@Param("parentTaskId") UUID parentTaskId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select p from TaskboardTask p where p.taskboard = :taskboard and p.status = :status and p.subStatus = :subStatus and p.tenantId =:tenantId and p.activeFlag = :activeFlag")
	public List<TaskboardTask> getTaskboardTaskByPreviousSubStatusName(@Param("taskboard") Taskboard taskboard,
			@Param("status") String status, @Param("subStatus") String subStatus, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where ("
			+ " p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
//			+ " p.sequence_no < 15 and "
			+ " exists (select x from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.user_id in :userIdList and x.active_flag=:activeFlag and x.tenant_id=:tenantId)"
			+ ") group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTasksWithAssignedUsers(@Param("taskboardId") UUID taskboardId,
			@Param("userIdList") List<UUID> userIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select * from taskboard_task  p where (p.taskboard_id=:taskboardId and p.active_flag = :activeFlag and p.tenant_id =:tenantId and "
			+ " exists (select x from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.user_id=:userId and x.active_flag=:activeFlag and x.tenant_id=:tenantId)"
			+ ") order by p.modified_on desc LIMIT :limit", nativeQuery = true)
	public List<TaskboardTask> getTaskboardTasksWithAssignedUsers(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userid, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("limit") int limit);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where ("
			+ " p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
//			+ " p.sequence_no < 15 and "
			+ " exists (select x from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.user_id in :userIdList and x.active_flag=:activeFlag and x.tenant_id=:tenantId)"
			+ ") group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTasksWithAssignedUsersWithSprint(@Param("taskboardId") UUID taskboardId,
			@Param("userIdList") List<UUID> userIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("sprintId") UUID sprintId);

	@Query(value = "select * from taskboard_task  p where (p.taskboard_id=:taskboardId and p.active_flag = :activeFlag "
			+ "and p.tenant_id =:tenantId and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
			+ " exists (select x from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.user_id=:userId and x.active_flag=:activeFlag and x.tenant_id=:tenantId)) order by p.modified_on desc LIMIT :limit", nativeQuery = true)
	public List<TaskboardTask> getTaskboardTasksWithAssignedUsersWithSprint(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userid, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("limit") int limit, @Param("sprintId") UUID sprintId);

	@Query(value = "select * from taskboard_task p where (p.taskboard_id=:taskboardId "
			+ "and p.active_flag = :activeFlag and p.tenant_id =:tenantId and "
			+ "(case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id is null) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))  else true end) and"
			+ " exists (select * from taskboard_task_labels tl where tl.taskboard_task_id = p.id and tl.taskboard_labels_id in  :taskboardLabelsIdList and "
			+ "tl.active_flag=:activeFlag and tl.tenant_id=:tenantId))", nativeQuery = true)
	public List<TaskboardTask> getTaskboardTasksForUnAssignedUsersWithLabels(@Param("taskboardId") UUID taskboardId,
			@Param("taskboardLabelsIdList") List<UUID> taskboardLabelsIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where ("
			+ " p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ "((case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id in :userIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))  else :isUnassignedUser end) and "
			+ "(case when exists (select * from taskboard_task_labels x where x.taskboard_task_id = p.id)"
			+ " then (exists (select * from taskboard_task_labels tl where (tl.taskboard_task_id = p.id and tl.taskboard_labels_id in  :taskboardLabelsIdList and "
			+ "tl.active_flag=:activeFlag and tl.tenant_id=:tenantId)))  else :isNoLabel end)) and "
//			+ " p.sequence_no < 15 and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTasksForUnAssignedUsersWithLabels(@Param("taskboardId") UUID taskboardId,
			@Param("userIdList") List<UUID> userIdList, @Param("userId") UUID userid,
			@Param("groupIdList") List<UUID> groupIdList,
			@Param("taskboardLabelsIdList") List<UUID> taskboardLabelsIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("isNoLabel") boolean isNoLabel,
			@Param("isUnassignedUser") boolean isUnassignedUser);

	@Query(value = "select * from taskboard_task p where (p.taskboard_id=:taskboardId "
			+ "and p.status =:status and p.active_flag = :activeFlag and p.tenant_id =:tenantId and "
			+ "exists (select * from taskboard t where t.id = p.taskboard_id and t.active_flag =:activeFlag) and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ "exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and t.active_flag = :activeFlag) and "
			+ "((case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id in :userIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))  else :isUnassignedUser end) and "
			+ "(case when exists (select * from taskboard_task_labels x where x.taskboard_task_id = p.id)"
			+ " then (exists (select * from taskboard_task_labels tl where (tl.taskboard_task_id = p.id and tl.taskboard_labels_id in  :taskboardLabelsIdList and "
			+ "tl.active_flag=:activeFlag and tl.tenant_id=:tenantId)))  else :isNoLabel end))"
			+ ") order by p.modified_on desc LIMIT :limit", nativeQuery = true)
	public List<TaskboardTask> getTaskboardTasksForUnAssignedUsersWithLabels(@Param("taskboardId") UUID taskboardId,
			@Param("status") String status, @Param("userIdList") List<UUID> userIdList, @Param("userId") UUID userid,
			@Param("groupIdList") List<UUID> groupIdList,
			@Param("taskboardLabelsIdList") List<UUID> taskboardLabelsIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("isNoLabel") boolean isNoLabel,
			@Param("isUnassignedUser") boolean isUnassignedUser, @Param("limit") int limit);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where ("
			+ " p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ "((case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id in :userIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))  else :isUnassignedUser end) and "
			+ "(case when exists (select * from taskboard_task_labels x where x.taskboard_task_id = p.id)"
			+ " then (exists (select * from taskboard_task_labels tl where (tl.taskboard_task_id = p.id and tl.taskboard_labels_id in  :taskboardLabelsIdList and "
			+ "tl.active_flag=:activeFlag and tl.tenant_id=:tenantId)))  else :isNoLabel end)) and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
//			+ " p.sequence_no < 15 and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTasksForUnAssignedUsersWithLabelsWithSprint(
			@Param("taskboardId") UUID taskboardId, @Param("userIdList") List<UUID> userIdList,
			@Param("userId") UUID userid, @Param("groupIdList") List<UUID> groupIdList,
			@Param("taskboardLabelsIdList") List<UUID> taskboardLabelsIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("isNoLabel") boolean isNoLabel,
			@Param("isUnassignedUser") boolean isUnassignedUser, @Param("sprintId") UUID sprintId);

	@Query(value = "select * from taskboard_task p where (p.taskboard_id=:taskboardId "
			+ "and p.status =:status and p.active_flag = :activeFlag and p.tenant_id =:tenantId and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
			+ "exists (select * from taskboard t where t.id = p.taskboard_id and t.active_flag =:activeFlag) and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ "exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and t.active_flag = :activeFlag) and "
			+ "((case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id in :userIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))  else :isUnassignedUser end) and "
			+ "(case when exists (select * from taskboard_task_labels x where x.taskboard_task_id = p.id)"
			+ " then (exists (select * from taskboard_task_labels tl where (tl.taskboard_task_id = p.id and tl.taskboard_labels_id in  :taskboardLabelsIdList and "
			+ "tl.active_flag=:activeFlag and tl.tenant_id=:tenantId)))  else :isNoLabel end))) order by p.modified_on desc LIMIT :limit", nativeQuery = true)
	public List<TaskboardTask> getTaskboardTasksForUnAssignedUsersWithLabelsWithSprint(
			@Param("taskboardId") UUID taskboardId, @Param("status") String status,
			@Param("userIdList") List<UUID> userIdList, @Param("userId") UUID userid,
			@Param("groupIdList") List<UUID> groupIdList,
			@Param("taskboardLabelsIdList") List<UUID> taskboardLabelsIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("isNoLabel") boolean isNoLabel,
			@Param("isUnassignedUser") boolean isUnassignedUser, @Param("limit") int limit,
			@Param("sprintId") UUID sprintId);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where ( "
			+ " p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ "((case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id in :userIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))  else :isUnassignedUser end) or "
			+ "(case when exists (select * from taskboard_task_labels x where x.taskboard_task_id = p.id)"
			+ " then (exists (select * from taskboard_task_labels tl where (tl.taskboard_task_id = p.id and tl.taskboard_labels_id in  :taskboardLabelsIdList and "
			+ "tl.active_flag=:activeFlag and tl.tenant_id=:tenantId)))  else :isNoLabel end)) and"
//			+ " p.sequence_no < 15 and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTasksForAssignedUsersWithLabels(@Param("taskboardId") UUID taskboardId,
			@Param("userIdList") List<UUID> userIdList, @Param("userId") UUID userid,
			@Param("groupIdList") List<UUID> groupIdList,
			@Param("taskboardLabelsIdList") List<UUID> taskboardLabelsIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("isNoLabel") boolean isNoLabel,
			@Param("isUnassignedUser") boolean isUnassignedUser);

	@Query(value = "select * from taskboard_task p where (p.taskboard_id=:taskboardId "
			+ "and p.status =:status and p.active_flag = :activeFlag and p.tenant_id =:tenantId and "
			+ "exists (select * from taskboard t where t.id = p.taskboard_id and t.active_flag =:activeFlag) and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ "exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and t.active_flag = :activeFlag) and "
			+ "((case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id in :userIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))  else :isUnassignedUser end) or "
			+ "(case when exists (select * from taskboard_task_labels x where x.taskboard_task_id = p.id)"
			+ " then (exists (select * from taskboard_task_labels tl where (tl.taskboard_task_id = p.id and tl.taskboard_labels_id in  :taskboardLabelsIdList and "
			+ "tl.active_flag=:activeFlag and tl.tenant_id=:tenantId)))  else :isNoLabel end))"
			+ ") order by p.modified_on desc LIMIT :limit", nativeQuery = true)
	public List<TaskboardTask> getTaskboardTasksForAssignedUsersWithLabels(@Param("taskboardId") UUID taskboardId,
			@Param("status") String status, @Param("userIdList") List<UUID> userIdList, @Param("userId") UUID userid,
			@Param("groupIdList") List<UUID> groupIdList,
			@Param("taskboardLabelsIdList") List<UUID> taskboardLabelsIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("isNoLabel") boolean isNoLabel,
			@Param("isUnassignedUser") boolean isUnassignedUser, @Param("limit") int limit);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where ("
			+ " p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ "((case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id in :userIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))  else :isUnassignedUser end) or "
			+ "(case when exists (select * from taskboard_task_labels x where x.taskboard_task_id = p.id)"
			+ " then (exists (select * from taskboard_task_labels tl where (tl.taskboard_task_id = p.id and tl.taskboard_labels_id in  :taskboardLabelsIdList and "
			+ "tl.active_flag=:activeFlag and tl.tenant_id=:tenantId)))  else :isNoLabel end)) and"
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
//			+ " p.sequence_no < 15 and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTasksForAssignedUsersWithLabelsWithSprint(
			@Param("taskboardId") UUID taskboardId, @Param("userIdList") List<UUID> userIdList,
			@Param("userId") UUID userid, @Param("groupIdList") List<UUID> groupIdList,
			@Param("taskboardLabelsIdList") List<UUID> taskboardLabelsIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("isNoLabel") boolean isNoLabel,
			@Param("isUnassignedUser") boolean isUnassignedUser, @Param("sprintId") UUID sprintId);

	@Query(value = "select * from taskboard_task p where (p.taskboard_id=:taskboardId "
			+ "and p.status =:status and p.active_flag = :activeFlag and p.tenant_id =:tenantId and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
			+ "exists (select * from taskboard t where t.id = p.taskboard_id and t.active_flag =:activeFlag) and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ "exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and t.active_flag = :activeFlag) and "
			+ "((case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id in :userIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))  else :isUnassignedUser end) or "
			+ "(case when exists (select * from taskboard_task_labels x where x.taskboard_task_id = p.id)"
			+ " then (exists (select * from taskboard_task_labels tl where (tl.taskboard_task_id = p.id and tl.taskboard_labels_id in  :taskboardLabelsIdList and "
			+ "tl.active_flag=:activeFlag and tl.tenant_id=:tenantId)))  else :isNoLabel end))"
			+ ") order by p.modified_on desc LIMIT :limit", nativeQuery = true)
	public List<TaskboardTask> getTaskboardTasksForAssignedUsersWithLabelsWithSprint(
			@Param("taskboardId") UUID taskboardId, @Param("status") String status,
			@Param("userIdList") List<UUID> userIdList, @Param("userId") UUID userid,
			@Param("groupIdList") List<UUID> groupIdList,
			@Param("taskboardLabelsIdList") List<UUID> taskboardLabelsIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("isNoLabel") boolean isNoLabel,
			@Param("isUnassignedUser") boolean isUnassignedUser, @Param("limit") int limit,
			@Param("sprintId") UUID sprintId);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where ("
			+ " p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ "((case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id = :userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))  else true end) and "
			+ "(case when exists (select * from taskboard_task_labels x where x.taskboard_task_id = p.id)"
			+ " then (exists (select * from taskboard_task_labels tl where (tl.taskboard_task_id = p.id and tl.taskboard_labels_id in  :taskboardLabelsIdList and "
			+ "tl.active_flag=:activeFlag and tl.tenant_id=:tenantId)))  else :isNoLabel end)) and"
//			+ " p.sequence_no < 15 and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTasksWithLabelsOnly(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userid, @Param("groupIdList") List<UUID> groupIdList,
			@Param("taskboardLabelsIdList") List<UUID> taskboardLabelsIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("isNoLabel") boolean isNoLabel);

	@Query(value = "select * from taskboard_task p where (p.taskboard_id=:taskboardId "
			+ "and p.status =:status and p.active_flag = :activeFlag and p.tenant_id =:tenantId and "
			+ "exists (select * from taskboard t where t.id = p.taskboard_id and t.active_flag =:activeFlag) and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ "exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and t.active_flag = :activeFlag) and "
			+ "((case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id = :userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))  else true end) and "
			+ "(case when exists (select * from taskboard_task_labels x where x.taskboard_task_id = p.id)"
			+ " then (exists (select * from taskboard_task_labels tl where (tl.taskboard_task_id = p.id and tl.taskboard_labels_id in  :taskboardLabelsIdList and "
			+ "tl.active_flag=:activeFlag and tl.tenant_id=:tenantId)))  else :isNoLabel end))"
			+ ") order by p.modified_on desc LIMIT :limit", nativeQuery = true)
	public List<TaskboardTask> getTaskboardTasksWithLabelsOnly(@Param("taskboardId") UUID taskboardId,
			@Param("status") String status, @Param("userId") UUID userid, @Param("groupIdList") List<UUID> groupIdList,
			@Param("taskboardLabelsIdList") List<UUID> taskboardLabelsIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("isNoLabel") boolean isNoLabel, @Param("limit") int limit);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where ("
			+ " p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ "((case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id = :userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))  else true end) and "
			+ "(case when exists (select * from taskboard_task_labels x where x.taskboard_task_id = p.id)"
			+ " then (exists (select * from taskboard_task_labels tl where (tl.taskboard_task_id = p.id and tl.taskboard_labels_id in  :taskboardLabelsIdList and "
			+ "tl.active_flag=:activeFlag and tl.tenant_id=:tenantId)))  else :isNoLabel end)) and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
//			+ " p.sequence_no < 15 and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTasksWithLabelsOnlyWithSprint(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userid, @Param("groupIdList") List<UUID> groupIdList,
			@Param("taskboardLabelsIdList") List<UUID> taskboardLabelsIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("isNoLabel") boolean isNoLabel,
			@Param("sprintId") UUID sprintId);

	@Query(value = "select * from taskboard_task p where (p.taskboard_id=:taskboardId "
			+ "and p.status =:status and p.active_flag = :activeFlag and p.tenant_id =:tenantId and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
			+ "exists (select * from taskboard t where t.id = p.taskboard_id and t.active_flag =:activeFlag) and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ "exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and t.active_flag = :activeFlag) and "
			+ "((case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id = :userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))  else true end) and "
			+ "(case when exists (select * from taskboard_task_labels x where x.taskboard_task_id = p.id)"
			+ " then (exists (select * from taskboard_task_labels tl where (tl.taskboard_task_id = p.id and tl.taskboard_labels_id in  :taskboardLabelsIdList and "
			+ "tl.active_flag=:activeFlag and tl.tenant_id=:tenantId)))  else :isNoLabel end))) order by p.modified_on desc LIMIT :limit", nativeQuery = true)
	public List<TaskboardTask> getTaskboardTasksWithLabelsOnlyWithSprint(@Param("taskboardId") UUID taskboardId,
			@Param("status") String status, @Param("userId") UUID userid, @Param("groupIdList") List<UUID> groupIdList,
			@Param("taskboardLabelsIdList") List<UUID> taskboardLabelsIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("isNoLabel") boolean isNoLabel, @Param("limit") int limit,
			@Param("sprintId") UUID sprintId);

	@Query(value = "select * from taskboard_task p where (p.taskboard_id=:taskboardId "
			+ "and p.active_flag = :activeFlag and p.tenant_id =:tenantId and "
			+ "(case when exists (select * from taskboard_task_labels x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_labels tl where (tl.taskboard_task_id = p.id and tl.taskboard_labels_id in  :taskboardLabelsIdList and "
			+ "tl.active_flag=:activeFlag and tl.tenant_id=:tenantId)))  else :isNoLabel end))", nativeQuery = true)
	public List<TaskboardTask> getTaskboardTasksWithLabels(@Param("taskboardId") UUID taskboardId,
			@Param("taskboardLabelsIdList") List<UUID> taskboardLabelsIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("isNoLabel") boolean isNoLabel);

	@Query(value = "select * from taskboard_task p where (p.taskboard_id=:taskboardId "
			+ "and p.active_flag = :activeFlag and p.tenant_id =:tenantId and "
			+ "(case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.userId in :userIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))  else true end) and"
			+ " exists (select * from taskboard_task_labels tl where tl.taskboard_task_id = p.id and "
			+ "tl.taskboard_labels_id in  :taskboardLabelsIdList and "
			+ "tl.active_flag=:activeFlag and tl.tenant_id=:tenantId))", nativeQuery = true)
	public List<TaskboardTask> getTaskboardTasksForAssignedUsersWithLabels(@Param("taskboardId") UUID taskboardId,
			@Param("taskboardLabelsIdList") List<UUID> taskboardLabelsIdList,
			@Param("userIdList") List<UUID> userIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select * from taskboard_task p where (p.taskboard_id=:taskboardId "
			+ "and p.active_flag = :activeFlag and p.tenant_id =:tenantId and "
			+ "(case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id in :userIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))  else true end) and "
			+ "(case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_labels tl where (tl.taskboard_task_id = p.id and tl.taskboard_labels_id in  :taskboardLabelsIdList and "
			+ "tl.active_flag=:activeFlag and tl.tenant_id=:tenantId)))  else true end))", nativeQuery = true)
	public List<TaskboardTask> getTaskboardTasksForAssignedUsersWithNoLabels(@Param("taskboardId") UUID taskboardId,
			@Param("taskboardLabelsIdList") List<UUID> taskboardLabelsIdList,
			@Param("userIdList") List<UUID> userIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select * from taskboard_task p where (p.taskboard_id=:taskboardId and p.status =:status and p.active_flag = :activeFlag and p.tenant_id =:tenantId "
			+ "and (case when exists (select * from taskboard_task_assigned_users x where "
			+ "x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select * from taskboard_task_assigned_users x where "
			+ "(x.taskboard_task_id = p.id and (x.user_id =:userId) "
			+ "and x.active_flag = :activeFlag and x.tenant_id =:tenantId))) else true end)) order by p.modified_on desc limit 25", nativeQuery = true)
	public List<TaskboardTask> getTasksForDoneColumnsWithoutOwners(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("status") String status, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select * from taskboard_task p where (p.taskboard_id=:taskboardId and p.status =:status and p.active_flag = :activeFlag and p.tenant_id =:tenantId) order by p.modified_on desc limit 25", nativeQuery = true)
	public List<TaskboardTask> getTasksForDoneColumnsWithOwners(@Param("taskboardId") UUID taskboardId,
			@Param("status") String status, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select * from taskboard_task p where p.taskboard_id=:taskboardId and"
			+ " p.task_type = 'parentTask' and p.status =:status and p.tenant_id =:tenantId and "
			+ "p.active_flag = :activeFlag and "
			+ "  ((exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId))) or "
			+ " (exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and t.active_flag = :activeFlag) and "
			+ " (case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and (x.user_id =:userId or x.user_id is null) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ "  else true end)))", nativeQuery = true)
	public List<TaskboardTask> getDoneTaskWithoutFilter(@Param("status") String status, @Param("userId") UUID userId,
			@Param("taskboardId") UUID taskboardId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, Pageable pageable);

	@Query("select p from TaskboardTask p where p.taskboard.id=:taskboardId and"
			+ " p.taskType = 'parentTask' and p.tenantId =:tenantId and " + "p.activeFlag = :activeFlag")
	public List<TaskboardTask> getDeletedTaskWithoutFilterForSubStatus(@Param("taskboardId") UUID taskboardId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select * from taskboard_task p where p.taskboard_id=:taskboardId and"
			+ " p.task_type = 'parentTask' and p.status =:status and p.tenant_id =:tenantId and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ "p.active_flag = :activeFlag and (case when exists (select * from taskboard_task_assigned_users x"
			+ " where x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select * from taskboard_task_assigned_users x"
			+ " where (x.taskboard_task_id = p.id and (x.user_id in :assignedUserId) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else false end)", nativeQuery = true)
	public List<TaskboardTask> getDoneTaskWithAssignedUser(@Param("status") String status, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("taskboardId") UUID taskboardId,
			@Param("assignedUserId") List<UUID> assignedUserId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.taskboard_id=:taskboardId and"
			+ " p.task_type = 'parentTask' and p.status =:status and p.tenant_id =:tenantId and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ "p.active_flag = :activeFlag and (case when exists (select * from taskboard_task_assigned_users x"
			+ " where x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select * from taskboard_task_assigned_users x"
			+ " where (x.taskboard_task_id = p.id and (x.user_id in :assignedUserId or x.user_id is null) and "
			+ "x.active_flag=:activeFlag and x.tenant_id=:tenantId)))" + " else true end)", nativeQuery = true)
	public List<TaskboardTask> getDoneTaskWithAssignedAndUnAssignedUser(@Param("status") String status,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("taskboardId") UUID taskboardId, @Param("assignedUserId") List<UUID> assignedUserId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.taskboard_id=:taskboardId and"
			+ " p.task_type = 'parentTask' and p.status =:status and p.tenant_id =:tenantId and "
			+ "  exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) and "
			+ "p.active_flag = :activeFlag and (case when exists (select * from taskboard_task_assigned_users x"
			+ " where x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select * from taskboard_task_assigned_users x"
			+ " where (x.taskboard_task_id = p.id and (x.user_id is null) and "
			+ "x.active_flag=:activeFlag and x.tenant_id=:tenantId)))" + " else true end)", nativeQuery = true)
	public List<TaskboardTask> getDoneTaskWithUnAssignedUser(@Param("status") String status,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("taskboardId") UUID taskboardId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.taskboard_id=:taskboardId and"
			+ " p.task_type = 'parentTask' and p.status =:status and p.tenant_id =:tenantId and "
			+ "p.active_flag = :activeFlag and (case when exists (select * from taskboard_task_assigned_users x"
			+ " where x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select * from taskboard_task_assigned_users x"
			+ " where (x.taskboard_task_id = p.id and (x.user_id =:userId) and "
			+ "x.active_flag=:activeFlag and x.tenant_id=:tenantId)))" + " else true end)", nativeQuery = true)
	public List<TaskboardTask> getDoneTaskWithLoggedInUser(@Param("status") String status,
			@Param("taskboardId") UUID taskboardId, @Param("userId") UUID userId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where ((UPPER(p.task_id) like UPPER(:taskId) or UPPER(p.task_name) like UPPER(:taskId)) and "
			+ " p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
//			+ " p.sequence_no < 15 and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTasksByTaskIdSearch(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, @Param("taskId") String taskId);

	@Query(value = "select * from taskboard_task p where (p.taskboard_id=:taskboardId and UPPER(p.task_id) like UPPER(:taskId) "
			+ "and p.status =:status and p.active_flag = :activeFlag and p.tenant_id =:tenantId and "
			+ "(case when exists (select * from taskboard_task_assigned_users x where "
			+ "x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ "exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and "
			+ "x.tenant_id=:tenantId)))"
			+ " else exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) order by p.modified_on desc LIMIT :limit", nativeQuery = true)
	public List<TaskboardTask> getTaskboardTasksByTaskIdSearch(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList, @Param("status") String status,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, @Param("taskId") String taskId,
			@Param("limit") int limit);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where ((UPPER(p.task_id) like UPPER(:taskId) or UPPER(p.task_name) like UPPER(:taskId)) and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
			+ " p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
//			+ " p.sequence_no < 15 and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTasksByTaskIdSearchWithSprint(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, @Param("taskId") String taskId,
			@Param("sprintId") UUID sprintId);

	@Query(value = "select * from taskboard_task p where (p.taskboard_id=:taskboardId and UPPER(p.task_id) like UPPER(:taskId) "
			+ "and p.status =:status and p.active_flag = :activeFlag and p.tenant_id =:tenantId and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
			+ "(case when exists (select * from taskboard_task_assigned_users x where "
			+ "x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ "exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and "
			+ "x.tenant_id=:tenantId)))"
			+ " else exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) order by p.modified_on desc LIMIT :limit", nativeQuery = true)
	public List<TaskboardTask> getTaskboardTasksByTaskIdSearchWithSprint(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList, @Param("status") String status,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, @Param("taskId") String taskId,
			@Param("limit") int limit, @Param("sprintId") UUID sprintId);

	@Query(value = "select * from taskboard_task p where p.taskboard_id=:taskboardId and"
			+ " p.task_type = 'parentTask' and p.tenant_id =:tenantId and " + "p.active_flag = 'N'", nativeQuery = true)
	public List<TaskboardTask> getDeletedTaskWithoutFilter(@Param("taskboardId") UUID taskboardId,
			@Param("tenantId") String tenantId, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.taskboard_id=:taskboardId and"
			+ " p.task_type = 'parentTask' and p.tenant_id =:tenantId and "
			+ "p.active_flag = 'N' and (case when exists (select * from taskboard_task_assigned_users x"
			+ " where x.taskboard_task_id = p.id and x.active_flag=:activeFlag)"
			+ " then (exists (select * from taskboard_task_assigned_users x"
			+ " where (x.taskboard_task_id = p.id and (x.user_id in :assignedUserId) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else false end)", nativeQuery = true)
	public List<TaskboardTask> getDeletedTaskWithAssignedUser(@Param("taskboardId") UUID taskboardId,
			@Param("assignedUserId") List<UUID> assignedUserId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.taskboard_id=:taskboardId and"
			+ " p.task_type = 'parentTask' and p.tenant_id =:tenantId and "
			+ "p.active_flag = 'N' and (case when exists (select * from taskboard_task_assigned_users x"
			+ " where x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select * from taskboard_task_assigned_users x"
			+ " where (x.taskboard_task_id = p.id and (x.user_id in :assignedUserId or x.user_id is null) and "
			+ "x.active_flag=:activeFlag and x.tenant_id=:tenantId)))" + " else true end)", nativeQuery = true)
	public List<TaskboardTask> getDeletedTaskWithAssignedAndUnAssignedUser(@Param("taskboardId") UUID taskboardId,
			@Param("assignedUserId") List<UUID> assignedUserId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.taskboard_id=:taskboardId and"
			+ " p.task_type = 'parentTask' and p.tenant_id =:tenantId and "
			+ "p.active_flag = 'N' and (case when exists (select * from taskboard_task_assigned_users x"
			+ " where x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select * from taskboard_task_assigned_users x"
			+ " where (x.taskboard_task_id = p.id and (x.user_id is null) and "
			+ "x.active_flag=:activeFlag and x.tenant_id=:tenantId)))" + " else true end)", nativeQuery = true)
	public List<TaskboardTask> getDeletedTaskWithUnAssignedUser(@Param("taskboardId") UUID taskboardId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.taskboard_id=:taskboardId and"
			+ " p.task_type = 'parentTask' and p.tenant_id =:tenantId and "
			+ "p.active_flag = 'N' and (case when exists (select * from taskboard_task_assigned_users x"
			+ " where x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select * from taskboard_task_assigned_users x"
			+ " where (x.taskboard_task_id = p.id and (x.user_id =:userId) and "
			+ "x.active_flag=:activeFlag and x.tenant_id=:tenantId)))" + " else true end)", nativeQuery = true)
	public List<TaskboardTask> getDeletedTaskWithLoggedInUser(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			Pageable pageable);

	@Query("select t from TaskboardTask t where t.activeFlag = 'Y' and t.tenantId = :tenantId and t.taskboard.id in (:listTaskboardIds) and t.dueDate is not null and ((t.dueDate <= :today) OR t.dueDate < :tomorrow) "
			+ " and (t.nextReminderTimestamp is null OR DATE(t.nextReminderTimestamp) < DATE(:today)) ")
	public List<TaskboardTask> findTasksforTaskBoardIdsPastDueDate(
			@Param("listTaskboardIds") List<UUID> listTaskboardIds, @Param("tenantId") String tenantId,
			@Param("today") Timestamp todayDate, @Param("tomorrow") Timestamp tomorrow);

	@Query(value = "select tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order <> (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTaskList(@Param("taskboardId") UUID taskboardId, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "SELECT status as status, COUNT(*) as taskCount"
			+ " FROM taskboard_task p where taskboard_id=:taskboardId and active_flag = :activeFlag and "
			+ " p.task_type='parentTask' and p.tenant_id =:tenantId and "
			+ "		 (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ "			 x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "			 ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ "			 exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "			 (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ "			 else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "			 ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)"
			+ "GROUP BY status", nativeQuery = true)
	public List<Object[]> getTaskboardInitialTaskListCount(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "SELECT cast(p.parent_task_id as varchar), COUNT(*) as taskCount"
			+ " FROM taskboard_task p where taskboard_id=:taskboardId and active_flag = :activeFlag and "
			+ " p.task_type='subtask' and p.tenant_id =:tenantId and "
			+ "		 (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ "			 x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "			 ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ "			 exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "			 (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag='Y' and x.tenant_id=:tenantId)))"
			+ "			 else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "			 ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)"
			+ "GROUP BY p.parent_task_id", nativeQuery = true)
	public List<Object[]> getTaskboardInitialTaskListSubtaskCount(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "SELECT p.status, cast(p.id as varchar)"
			+ " FROM taskboard_task p where p.taskboard_id=:taskboardId and p.active_flag =:activeFlag and "
			+ " p.id in :taskId and p.tenant_id =:tenantId " + "GROUP BY p.status, p.id", nativeQuery = true)
	public List<Object[]> getTaskboardInitialTaskListSubTaskWithParentTaskId(@Param("taskboardId") UUID taskboardId,
			@Param("taskId") List<UUID> taskId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "SELECT status as status, COUNT(*) as taskCount"
			+ " FROM taskboard_task p where taskboard_id=:taskboardId and active_flag = :activeFlag and "
			+ " p.task_type='parentTask' and p.tenant_id =:tenantId and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
			+ "		 (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ "			 x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "			 ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ "			 exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "			 (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ "			 else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "			 ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)"
			+ "GROUP BY status", nativeQuery = true)
	public List<Object[]> getTaskboardInitialTaskListCountSprint(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("sprintId") UUID sprintId);

	@Query(value = "SELECT cast(p.parent_task_id as varchar), COUNT(*) as taskCount"
			+ " FROM taskboard_task p where taskboard_id=:taskboardId and active_flag = :activeFlag and "
			+ " p.task_type='subtask' and p.tenant_id =:tenantId and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
			+ "		 (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ "			 x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "			 ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ "			 exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "			 (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag='Y' and x.tenant_id=:tenantId)))"
			+ "			 else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "			 ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)"
			+ "GROUP BY p.parent_task_id", nativeQuery = true)
	public List<Object[]> getTaskboardInitialTaskListSubtaskCountSprint(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("sprintId") UUID sprintId);

	@Query(value = "SELECT p.status, cast(p.id as varchar)"
			+ " FROM taskboard_task p where p.taskboard_id=:taskboardId and p.active_flag =:activeFlag and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
			+ " p.id in :taskId and p.tenant_id =:tenantId " + "GROUP BY p.status, p.id", nativeQuery = true)
	public List<Object[]> getTaskboardInitialTaskListSubTaskWithParentTaskIdSprint(
			@Param("taskboardId") UUID taskboardId, @Param("taskId") List<UUID> taskId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("sprintId") UUID sprintId);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
//			+ " p.sequence_no < 15 and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order <> (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardInitialTaskList(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select "
			+ " tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order <> (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardInitialTaskListBySprint(@Param("taskboardId") UUID taskboardId,
			@Param("sprintId") UUID sprintId, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

// @Param("sprintId") UUID sprintId,
	@Query(value = "select " + " * FROM (SELECT " + "	ROW_NUMBER() OVER (PARTITION BY p.status) AS r, "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
//			+ " p.sequence_no >= 15 and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order <> (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo"
			+ " ) xp where xp.r > :startIndex and xp.r <= :endIndex", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardRemainingTaskList(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startIndex") int startIndex, @Param("endIndex") int endIndex);

	@Query(value = "select tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order = (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public Set<TaskEntityVO> getTaskboardTaskListForDoneColumn(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order = (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and"
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public Set<TaskEntityVO> getTaskboardTaskListForDoneColumnBysprint(@Param("taskboardId") UUID taskboardId,
			@Param("sprintId") UUID sprintId, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ "cast(p.task_data as varchar) as taskData,"
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn,  cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId, ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ "cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ "taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ "ttl.active_flag = 'Y' and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ "tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = 'Y' and "
			+ "tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = 'Y' and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = 'Y' and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = 'Y'"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ "p.active_flag = 'N' and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ "(case when exists (select 1 from taskboard_task_assigned_users x where "
			+ "x.taskboard_task_id = p.id and x.active_flag='Y') then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag = 'Y' and (ts.user_id = :userId)) or "
			+ "exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag='Y' and "
			+ "x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag = 'Y' and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ "tbc.column_order, tbc.column_name, p.id, ttl.label_name,	tbl.id,	ttl.id,	ttau.id , ttc.id, ttf.id order by tbc.column_order", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTaskListForDeletedTask(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId);

	@Query(value = "select tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ "cast(p.task_data as varchar) as taskData,"
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn,  cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId, ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ "cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ "taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ "ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ "tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ "tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ "p.active_flag = :activeFlag and p.status =:status and tbc.taskboard_id = p.taskboard_id and "
			+ "(case when exists (select 1 from taskboard_task_assigned_users x where "
			+ "x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ "exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and "
			+ "x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ "tbc.column_order, tbc.column_name, p.id, ttl.label_name,	tbl.id,	ttl.id,	ttau.id , ttc.id, ttf.id order by tbc.column_order", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTaskListForArchivedTask(@Param("taskboardId") UUID taskboardId,
			@Param("status") String status, @Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where ("
			+ " p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
//			+ " p.sequence_no < 15 and "
			+ "(case when exists (select * from taskboard_task_assigned_users x where "
			+ "x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then false"
			+ " else exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)"
			+ ") group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTaskListsForUnAssignedUser(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select * from taskboard_task p where p.taskboard_id=:taskboardId "
			+ " and p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ "(case when exists (select * from taskboard_task_assigned_users x where "
			+ "x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then false"
			+ " else exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)", nativeQuery = true)
	public List<TaskboardTask> getTaskboardTaskListForUnAssignedUser(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where ("
			+ " p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
//			+ " p.sequence_no < 15 and "
			+ "(case when exists (select * from taskboard_task_assigned_users x where "
			+ "x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then false"
			+ " else exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)"
			+ ") group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTaskListsForUnAssignedUserWithSprint(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("sprintId") UUID sprintId);

	@Query(value = "select * from taskboard_task p where p.taskboard_id=:taskboardId "
			+ " and p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
			+ "(case when exists (select * from taskboard_task_assigned_users x where "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
			+ "x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then false"
			+ " else exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)", nativeQuery = true)
	public List<TaskboardTask> getTaskboardTaskListForUnAssignedUserWithSprint(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("sprintId") UUID sprintId);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where ("
			+ " p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
//			+ " p.sequence_no < 15 and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTaskListsForFilter(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select * from taskboard_task p where p.taskboard_id=:taskboardId "
			+ " and p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ "(case when exists (select * from taskboard_task_assigned_users x where "
			+ "x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ "exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and "
			+ "x.tenant_id=:tenantId)))"
			+ " else exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)", nativeQuery = true)
	public List<TaskboardTask> getTaskboardTaskListForFilter(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where ("
			+ " p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
//			+ " p.sequence_no < 15 and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTaskListForFiltersWithSprint(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("sprintId") UUID sprintId);

	@Query(value = "select * from taskboard_task p where p.taskboard_id=:taskboardId "
			+ " and p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
			+ "(case when exists (select * from taskboard_task_assigned_users x where "
			+ "x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ "exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and "
			+ "x.tenant_id=:tenantId)))"
			+ " else exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)", nativeQuery = true)
	public List<TaskboardTask> getTaskboardTaskListForFilterWithSprint(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("sprintId") UUID sprintId);

//	@Query("select t from TaskboardTask t where t.taskboard.id=:id and t.tenantId=:tenantId and t.activeFlag=:activeFlag order by t.createdOn asc")
//	public List<TaskboardTask> getAllTasksByBoardId(@Param("id") UUID id, @Param("tenantId") String tenantId,
//			@Param("activeFlag") String activeFlag);

	@Query(value = "select * from taskboard_task p where p.taskboard_id=:taskboardId "
			+ " and p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ "(case when exists (select * from taskboard_task_assigned_users x where "
			+ "x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ "exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and "
			+ "x.tenant_id=:tenantId)))"
			+ " else exists (select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)", nativeQuery = true)
	public List<TaskboardTask> getAllTasksByBoardId(@Param("taskboardId") UUID taskboardId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and "
			+ "p.tenant_id =:tenantId and p.active_flag =:activeFlag and p.status in "
			+ "(select tc.column_name from taskboard_columns tc where "
			+ "tc.column_order = (select max(column_order) from taskboard_columns tbc "
			+ "where tbc.taskboard_id = p.taskboard_id)) and (exists (select * from taskboard_security ts "
			+ "where ts.taskboard_id = p.taskboard_id and ts.active_flag =:activeFlag and "
			+ "(ts.user_id =:userId) and exists ( select * from taskboard_columns tc where "
			+ "tc.taskboard_id = p.taskboard_id and p.status = tc.column_name and "
			+ "tc.active_flag =:activeFlag)) or exists ( select * from taskboard t where "
			+ "t.id = p.taskboard_id and t.active_flag =:activeFlag and (exists "
			+ "(select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and "
			+ "(x.owner_id =:userId))) else false end))))", nativeQuery = true)
	public List<TaskboardTask> getAllDoneTaskForAllWorkspace(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and "
			+ "p.tenant_id =:tenantId and p.active_flag =:activeFlag and p.status in "
			+ "(select tc.column_name from taskboard_columns tc where "
			+ "tc.column_order = (select max(column_order) from taskboard_columns tbc "
			+ "where tbc.taskboard_id = p.taskboard_id)) and (exists (select * from taskboard_security ts "
			+ "where ts.taskboard_id = p.taskboard_id and ts.active_flag =:activeFlag and "
			+ "(ts.user_id =:userId) and exists ( select * from taskboard_columns tc where "
			+ "tc.taskboard_id = p.taskboard_id and p.status = tc.column_name and "
			+ "tc.active_flag =:activeFlag)) or exists ( select * from taskboard t where "
			+ "t.id = p.taskboard_id and t.active_flag =:activeFlag and (exists "
			+ "(select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and "
			+ "(x.owner_id =:userId))) else false end))))", nativeQuery = true)
	public List<TaskboardTask> getAllDoneTaskForAllWorkspaceWithoutPagination(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and "
			+ "p.taskboard_id in :taskboardIdList and p.tenant_id =:tenantId and p.active_flag =:activeFlag and p.status in "
			+ "(select tc.column_name from taskboard_columns tc where "
			+ "tc.column_order = (select max(column_order) from taskboard_columns tbc "
			+ "where tbc.taskboard_id = p.taskboard_id)) and (exists (select * from taskboard_security ts "
			+ "where ts.taskboard_id = p.taskboard_id and ts.active_flag =:activeFlag and "
			+ "(ts.user_id =:userId) and exists ( select * from taskboard_columns tc where "
			+ "tc.taskboard_id = p.taskboard_id and p.status = tc.column_name and "
			+ "tc.active_flag =:activeFlag)) or exists ( select * from taskboard t where "
			+ "t.id = p.taskboard_id and t.active_flag =:activeFlag and (exists "
			+ "(select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and "
			+ "(x.owner_id =:userId))) else false end))))", nativeQuery = true)
	public List<TaskboardTask> getAllDoneTaskByTaskboardIdList(@Param("userId") UUID userId,
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and "
			+ "p.tenant_id =:tenantId and p.active_flag =:activeFlag and p.status in "
			+ "(select tc.column_name from taskboard_columns tc where tc.column_order <> "
			+ "(select max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and (exists ( select * from taskboard_security ts where "
			+ "ts.taskboard_id = p.taskboard_id and ts.active_flag =:activeFlag and (ts.user_id =:userId) "
			+ "and exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag)) or exists ( select * from "
			+ "taskboard t where t.id = p.taskboard_id and t.active_flag =:activeFlag and (exists "
			+ "(select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and "
			+ "(x.owner_id =:userId))) else false end))))", nativeQuery = true)
	public List<TaskboardTask> getAllInProgressTaskForAllWorkspace(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and "
			+ "p.tenant_id =:tenantId and p.active_flag =:activeFlag and p.status in "
			+ "(select tc.column_name from taskboard_columns tc where tc.column_order <> "
			+ "(select max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and (exists ( select * from taskboard_security ts where "
			+ "ts.taskboard_id = p.taskboard_id and ts.active_flag =:activeFlag and (ts.user_id =:userId) "
			+ "and exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag)) or exists ( select * from "
			+ "taskboard t where t.id = p.taskboard_id and t.active_flag =:activeFlag and (exists "
			+ "(select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and "
			+ "(x.owner_id =:userId))) else false end))))", nativeQuery = true)
	public List<TaskboardTask> getAllInProgressTaskForAllWorkspaceWithoutPagination(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and "
			+ "p.tenant_id =:tenantId and p.active_flag =:activeFlag and p.taskboard_id in :taskboardIdList "
			+ "and p.status in (select tc.column_name from taskboard_columns tc where tc.column_order <> "
			+ "(select max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and (exists ( select * from taskboard_security ts where "
			+ "ts.taskboard_id = p.taskboard_id and ts.active_flag =:activeFlag and (ts.user_id =:userId) "
			+ "and exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag)) or exists ( select * from "
			+ "taskboard t where t.id = p.taskboard_id and t.active_flag =:activeFlag and (exists "
			+ "(select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and "
			+ "(x.owner_id =:userId))) else false end))))", nativeQuery = true)
	public List<TaskboardTask> getAllInProgressTaskByTaskboardIdList(@Param("userId") UUID userId,
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and p.status in "
			+ "(select tc.column_name from taskboard_columns tc where tc.active_flag =:activeFlag and "
			+ "tc.tenant_id =:tenantId and tc.taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId "
			+ "and p.active_flag = 'N' and (exists ( select * from taskboard t where t.id = p.taskboard_id "
			+ "and t.active_flag =:activeFlag and (exists ( select * from yoro_workspace w where "
			+ "w.workspace_id = t.workspace_id and w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = t.workspace_id) then "
			+ "(exists ( select * from yoro_workspace_security x where x.workspace_id = t.workspace_id "
			+ "and x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end))) or exists "
			+ "(select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag =:activeFlag and (ts.user_id =:userId) and exists (select * from "
			+ "taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and "
			+ "t.active_flag =:activeFlag)))", nativeQuery = true)
	public List<TaskboardTask> getAllDeletedTaskForAllWorkspace(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and p.status in "
			+ "(select tc.column_name from taskboard_columns tc where tc.active_flag =:activeFlag and "
			+ "tc.tenant_id =:tenantId and tc.taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId "
			+ "and p.active_flag = 'N' and (exists ( select * from taskboard t where t.id = p.taskboard_id "
			+ "and t.active_flag =:activeFlag and (exists ( select * from yoro_workspace w where "
			+ "w.workspace_id = t.workspace_id and w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = t.workspace_id) then "
			+ "(exists ( select * from yoro_workspace_security x where x.workspace_id = t.workspace_id "
			+ "and x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end))) or exists "
			+ "(select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag =:activeFlag and (ts.user_id =:userId) and exists (select * from "
			+ "taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and "
			+ "t.active_flag =:activeFlag)))", nativeQuery = true)
	public List<TaskboardTask> getAllDeletedTaskForAllWorkspaceWithoutPagination(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and p.status in "
			+ "(select tc.column_name from taskboard_columns tc where tc.active_flag =:activeFlag and "
			+ "tc.tenant_id =:tenantId and tc.taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId "
			+ "and p.taskboard_id in :taskboardIdList "
			+ "and p.active_flag = 'N' and (exists ( select * from taskboard t where t.id = p.taskboard_id "
			+ "and t.active_flag =:activeFlag and (exists ( select * from yoro_workspace w where "
			+ "w.workspace_id = t.workspace_id and w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = t.workspace_id) then "
			+ "(exists ( select * from yoro_workspace_security x where x.workspace_id = t.workspace_id "
			+ "and x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end))) or exists "
			+ "(select * from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ "ts.active_flag =:activeFlag and (ts.user_id =:userId) and exists (select * from "
			+ "taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and "
			+ "t.active_flag =:activeFlag)))", nativeQuery = true)
	public List<TaskboardTask> getAllDeletedTaskByTaskboardIdList(@Param("userId") UUID userId,
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and p.status in "
			+ "(select tc.column_name from taskboard_columns tc where tc.active_flag =:activeFlag and "
			+ "tc.tenant_id =:tenantId and tc.taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and "
			+ "p.active_flag =:activeFlag and (exists ( select * from taskboard t where "
			+ "t.id = p.taskboard_id and (exists ( select * from yoro_workspace w where "
			+ "w.workspace_id = t.workspace_id and w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = t.workspace_id) then "
			+ "(exists ( select * from yoro_workspace_security x where x.workspace_id = t.workspace_id "
			+ "and x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) and "
			+ "t.active_flag =:activeFlag) or exists ( select * from taskboard_security ts where "
			+ "ts.taskboard_id = p.taskboard_id and ts.active_flag =:activeFlag and (ts.user_id =:userId) "
			+ "and exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag))) and (case when exists "
			+ "(select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then "
			+ "(exists ( select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id "
			+ "and (x.user_id is null) and x.active_flag =:activeFlag and x.tenant_id =:tenantId))) "
			+ "else true end)", nativeQuery = true)
	public List<TaskboardTask> getAllUnassignedTaskForAllWorkspace(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select count(*) from taskboard_task p where p.task_type = 'parentTask' and p.status not in "
			+ "(select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = ( select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id) and w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = ( select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id)) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = ( select c.workspace_id from taskboard c where c.id = p.taskboard_id) and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) or (exists (select ts "
			+ "from taskboard_security ts where ts.active_flag =:activeFlag and ts.tenant_id =:tenantId and "
			+ "ts.taskboard_id = p.taskboard_id and (ts.user_id =:userId and ts.user_id is not null)))) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) and (case when exists "
			+ "(select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and "
			+ "x.active_flag =:activeFlag) then (exists ( select * from taskboard_task_assigned_users x where "
			+ "(x.taskboard_task_id = p.id and x.active_flag =:activeFlag and x.tenant_id =:tenantId))) else "
			+ "false end)", nativeQuery = true)
	public Long getAllAssignedTaskCountForAllWorkspace(@Param("userId") UUID userId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select count(*) from taskboard_task p where p.task_type = 'parentTask' "
			+ "and p.created_on between :startDate and :endDate and p.status not in "
			+ "(select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = ( select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id) and w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = ( select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id)) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = ( select c.workspace_id from taskboard c where c.id = p.taskboard_id) and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) or (exists (select ts "
			+ "from taskboard_security ts where ts.active_flag =:activeFlag and ts.tenant_id =:tenantId and "
			+ "ts.taskboard_id = p.taskboard_id and (ts.user_id =:userId and ts.user_id is not null)))) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) and (case when exists "
			+ "(select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and "
			+ "x.active_flag =:activeFlag) then (exists ( select * from taskboard_task_assigned_users x where "
			+ "(x.taskboard_task_id = p.id and x.active_flag =:activeFlag and x.tenant_id =:tenantId))) else "
			+ "false end)", nativeQuery = true)
	public Long getAllAssignedTaskCountForAllWorkspaceWithDateFilter(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and p.status in "
			+ "(select tc.column_name from taskboard_columns tc where tc.active_flag =:activeFlag and "
			+ "tc.tenant_id =:tenantId and tc.taskboard_id = p.taskboard_id) and p.taskboard_id in :taskboardIdList "
			+ "and p.tenant_id =:tenantId and "
			+ "p.active_flag =:activeFlag and (exists ( select * from taskboard t where "
			+ "t.id = p.taskboard_id and (exists ( select * from yoro_workspace w where "
			+ "w.workspace_id = t.workspace_id and w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = t.workspace_id) then "
			+ "(exists ( select * from yoro_workspace_security x where x.workspace_id = t.workspace_id "
			+ "and x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) and "
			+ "t.active_flag =:activeFlag) or exists ( select * from taskboard_security ts where "
			+ "ts.taskboard_id = p.taskboard_id and ts.active_flag =:activeFlag and (ts.user_id =:userId) "
			+ "and exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag))) and (case when exists "
			+ "(select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then "
			+ "(exists ( select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id "
			+ "and (x.user_id is null) and x.active_flag =:activeFlag and x.tenant_id =:tenantId))) "
			+ "else true end)", nativeQuery = true)
	public List<TaskboardTask> getAllUnassignedTaskByTaskboardIdList(@Param("userId") UUID userId,
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and p.status not in "
			+ "(select tc.column_name from taskboard_columns tc where tc.column_order = "
			+ "(select max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = (select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id) and w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = (select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id)) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = (select c.workspace_id from taskboard c where c.id = p.taskboard_id) and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) or (exists "
			+ "(select ts from taskboard_security ts where ts.active_flag =:activeFlag and "
			+ "ts.tenant_id =:tenantId and ts.taskboard_id = p.taskboard_id and (ts.user_id =:userId)))) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag)", nativeQuery = true)
	public List<TaskboardTask> getTaskListForAllWorkplace(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and p.status not in (select "
			+ "tc.column_name from taskboard_columns tc where tc.column_order = (select max(column_order) from "
			+ "taskboard_columns where taskboard_id = p.taskboard_id) and taskboard_id = p.taskboard_id) and "
			+ "p.tenant_id =:tenantId and p.active_flag =:activeFlag and ((exists ( select * from yoro_workspace w "
			+ "where w.workspace_id = ( select c.workspace_id from taskboard c where c.id = p.taskboard_id) and "
			+ "w.active_flag =:activeFlag) or (case when exists ( select * from yoro_workspace_security x where "
			+ "x.workspace_id = ( select c.workspace_id from taskboard c where c.id = p.taskboard_id)) then (exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = ( select c.workspace_id from taskboard c "
			+ "where c.id = p.taskboard_id) and x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) "
			+ "or (exists ( select ts from taskboard_security ts where ts.active_flag =:activeFlag and "
			+ "ts.tenant_id =:tenantId and ts.taskboard_id = p.taskboard_id and (ts.user_id =:userId and ts.user_id is "
			+ "not null)))) and exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) and (case when exists (select * from "
			+ "taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag =:activeFlag) then "
			+ "(exists ( select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id in :userIdList) and x.active_flag =:activeFlag and x.tenant_id =:tenantId))) else "
			+ ":isUnassignedUser end)", nativeQuery = true)
	public List<TaskboardTask> getTaskListForAllWorkplaceWithUserIdList(@Param("userId") UUID userId,
			@Param("userIdList") List<UUID> userIdList, @Param("isUnassignedUser") boolean isUnassignedUser,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and p.status not in (select "
			+ "tc.column_name from taskboard_columns tc where tc.column_order = (select max(column_order) from "
			+ "taskboard_columns where taskboard_id = p.taskboard_id) and taskboard_id = p.taskboard_id) and "
			+ "p.tenant_id =:tenantId and p.active_flag =:activeFlag and ((exists (select * from yoro_workspace w where "
			+ "w.workspace_id = ( select c.workspace_id from taskboard c where c.id = p.taskboard_id) and "
			+ "w.active_flag =:activeFlag) or (case when exists ( select * from yoro_workspace_security x where "
			+ "x.workspace_id = ( select c.workspace_id from taskboard c where c.id = p.taskboard_id)) then (exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = ( select c.workspace_id from taskboard c "
			+ "where c.id = p.taskboard_id) and x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) "
			+ "or (exists ( select ts from taskboard_security ts where ts.active_flag =:activeFlag and "
			+ "ts.tenant_id =:tenantId and ts.taskboard_id = p.taskboard_id and (ts.user_id =:userId)))) and exists "
			+ "(select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and "
			+ "t.active_flag =:activeFlag) and (not exists ( select * from taskboard_task_assigned_users x where "
			+ "(x.taskboard_task_id = p.id and (x.user_id is not null) and x.active_flag =:activeFlag and "
			+ "x.tenant_id =:tenantId)))", nativeQuery = true)
	public List<TaskboardTask> getTaskListForAllWorkplaceWithUnassignedUser(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and "
			+ "p.taskboard_id in :taskboardIdList and p.status not in "
			+ "(select tc.column_name from taskboard_columns tc where tc.column_order = "
			+ "(select max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = (select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id) and w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = (select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id)) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = (select c.workspace_id from taskboard c where c.id = p.taskboard_id) and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) or (exists "
			+ "(select ts from taskboard_security ts where ts.active_flag =:activeFlag and "
			+ "ts.tenant_id =:tenantId and ts.taskboard_id = p.taskboard_id and (ts.user_id =:userId)))) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) and (case when exists "
			+ "(select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists "
			+ "(select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id =:userId) and x.active_flag =:activeFlag and x.tenant_id =:tenantId))) else true end)", nativeQuery = true)
	public List<TaskboardTask> getTaskListbyTaskboardIdList(@Param("userId") UUID userId,
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and "
			+ "p.taskboard_id in :taskboardIdList and p.status not in "
			+ "(select tc.column_name from taskboard_columns tc where tc.column_order = "
			+ "(select max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = (select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id) and w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = (select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id)) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = (select c.workspace_id from taskboard c where c.id = p.taskboard_id) and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) or (exists "
			+ "(select ts from taskboard_security ts where ts.active_flag =:activeFlag and "
			+ "ts.tenant_id =:tenantId and ts.taskboard_id = p.taskboard_id and (ts.user_id =:userId)))) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) and (case when exists "
			+ "(select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists "
			+ "(select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id in:userIdList and x.user_id is not null) and x.active_flag =:activeFlag and x.tenant_id =:tenantId))) else true end)", nativeQuery = true)
	public List<TaskboardTask> getTaskListbyTaskboardIdListWithUserIdList(@Param("userIdList") List<UUID> userIdList,
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and "
			+ "p.taskboard_id in :taskboardIdList and p.status not in "
			+ "(select tc.column_name from taskboard_columns tc where tc.column_order = "
			+ "(select max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = (select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id) and w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = (select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id)) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = (select c.workspace_id from taskboard c where c.id = p.taskboard_id) and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) or (exists "
			+ "(select ts from taskboard_security ts where ts.active_flag =:activeFlag and "
			+ "ts.tenant_id =:tenantId and ts.taskboard_id = p.taskboard_id and (ts.user_id =:userId)))) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) and (case when exists "
			+ "(select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists "
			+ "(select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id in:userIdList or x.user_id is null) and x.active_flag =:activeFlag and x.tenant_id =:tenantId))) else true end)", nativeQuery = true)
	public List<TaskboardTask> getTaskListbyTaskboardIdListWithUserIdListAndUnassignedUser(
			@Param("userIdList") List<UUID> userIdList, @Param("taskboardIdList") List<UUID> taskboardIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task p where p.task_type = 'parentTask' and "
			+ "p.taskboard_id in :taskboardIdList and p.status not in "
			+ "(select tc.column_name from taskboard_columns tc where tc.column_order = "
			+ "(select max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = (select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id) and w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = (select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id)) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = (select c.workspace_id from taskboard c where c.id = p.taskboard_id) and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) or (exists "
			+ "(select ts from taskboard_security ts where ts.active_flag =:activeFlag and "
			+ "ts.tenant_id =:tenantId and ts.taskboard_id = p.taskboard_id and (ts.user_id =:userId)))) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) and (case when exists "
			+ "(select * from taskboard_task_assigned_users x where x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists "
			+ "(select * from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ "(x.user_id is null) and x.active_flag =:activeFlag and x.tenant_id =:tenantId))) else true end)", nativeQuery = true)
	public List<TaskboardTask> getTaskListbyTaskboardIdListWithUserIdListAndUnassignedUser(
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, Pageable pageable);

	@Query("select t.taskboard.name, count("
			+ "CASE WHEN t.status not in (select tc.columnName from TaskboardColumns tc where tc.columnOrder = "
			+ "	(select max(tcs.columnOrder) from TaskboardColumns tcs where t.taskboard.id = tcs.taskboard.id) and "
			+ "	t.taskboard.id = tc.taskboard.id) THEN 1 ELSE NULL END), " + " count("
			+ "	CASE WHEN t.status in (select tc.columnName from TaskboardColumns tc where tc.columnOrder = "
			+ "	(select max(tcs.columnOrder) from TaskboardColumns tcs where t.taskboard.id = tcs.taskboard.id) and "
			+ "	t.taskboard.id = tc.taskboard.id) THEN 1 ELSE NULL END)"
			+ " from TaskboardTask t where t.status <> 'ERROR' and t.taskboard.workspaceId =:workspaceId "
			+ " and t.taskboard.tenantId = :tenantId and t.taskboard.activeFlag = :activeFlag"
			+ " and t.tenantId = :tenantId and t.activeFlag = :activeFlag " + "GROUP BY t.taskboard.name")
	public List<Object[]> getAllInprocessAndCompletedTaskCountByWorkspace(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("workspaceId") UUID workspaceId);

	@Query(value = "select p.priority, count(*) from taskboard_task p where p.priority is not null and p.status not "
			+ "in (select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = ( select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id) and w.active_flag = 'Y') or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = (select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id)) then (exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = ( select c.workspace_id from taskboard c where c.id = p.taskboard_id) and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) or (exists (select ts "
			+ "from taskboard_security ts where ts.active_flag =:activeFlag and ts.tenant_id =:tenantId and "
			+ "ts.taskboard_id = p.taskboard_id and (ts.user_id =:userId and ts.user_id is not null)))) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) group by p.priority", nativeQuery = true)
	public List<Object[]> getTaskByPriority(@Param("userId") UUID userId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select p.priority, count(*) from taskboard_task p where p.priority is not null and p.status not "
			+ "in (select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.created_on between :startDate and :endDate and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = ( select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id) and w.active_flag = 'Y') or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = (select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id)) then (exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = ( select c.workspace_id from taskboard c where c.id = p.taskboard_id) and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) or (exists (select ts "
			+ "from taskboard_security ts where ts.active_flag =:activeFlag and ts.tenant_id =:tenantId and "
			+ "ts.taskboard_id = p.taskboard_id and (ts.user_id =:userId and ts.user_id is not null)))) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) group by p.priority", nativeQuery = true)
	public List<Object[]> getTaskByPriorityWithDateFilter(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select p.priority, count(*) from taskboard_task p where p.priority is not null and "
			+ "p.status not in ( select tc.column_name from taskboard_columns tc where tc.column_order = "
			+ "(select max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.taskboard_id in :taskboardIdList and (case when exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id in :workspaceIdList) then (exists (select * from yoro_workspace_security x where "
			+ "x.workspace_id in :workspaceIdList and x.active_flag =:activeFlag and (x.owner_id =:userId))) "
			+ "else false end) group by p.priority", nativeQuery = true)
	public List<Object[]> getTaskByPriorityWithTaskboardIdListAndWorkspaceIdList(
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("workspaceIdList") List<UUID> workspaceIdList,
			@Param("userId") UUID userId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select p.priority, count(*) from taskboard_task p where p.priority is not null and "
			+ "p.status not in ( select tc.column_name from taskboard_columns tc where tc.column_order = "
			+ "(select max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.created_on between :startDate and :endDate and "
			+ "p.taskboard_id in :taskboardIdList and (case when exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id in :workspaceIdList) then (exists (select * from yoro_workspace_security x where "
			+ "x.workspace_id in :workspaceIdList and x.active_flag =:activeFlag and (x.owner_id =:userId))) "
			+ "else false end) group by p.priority", nativeQuery = true)
	public List<Object[]> getTaskByPriorityWithTaskboardIdListAndWorkspaceIdListWithDateFilter(
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("workspaceIdList") List<UUID> workspaceIdList,
			@Param("userId") UUID userId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select p.priority, count(*) from taskboard_task p where p.priority is not null and "
			+ "p.status not in ( select tc.column_name from taskboard_columns tc where tc.column_order = "
			+ "(select max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.taskboard_id in :taskboardIdList group by p.priority", nativeQuery = true)
	public List<Object[]> getTaskByPriorityWithTaskboardIdList(@Param("taskboardIdList") List<UUID> taskboardIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select p.priority, count(*) from taskboard_task p where p.priority is not null and "
			+ "p.status not in ( select tc.column_name from taskboard_columns tc where tc.column_order = "
			+ "(select max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.created_on between :startDate and :endDate and "
			+ "p.taskboard_id in :taskboardIdList group by p.priority", nativeQuery = true)
	public List<Object[]> getTaskByPriorityWithTaskboardIdListWithDateFilter(
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate);

	@Query(value = "select p.priority, count(*) from taskboard_task p where p.priority is not null and "
			+ "p.status not in ( select tc.column_name from taskboard_columns tc where tc.column_order = "
			+ "(select max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "(case when exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id in :workspaceIdList) then (exists (select * from yoro_workspace_security x where "
			+ "x.workspace_id in :workspaceIdList and x.active_flag =:activeFlag and (x.owner_id =:userId))) "
			+ "else false end) group by p.priority", nativeQuery = true)
	public List<Object[]> getTaskByPriorityWithWorkspaceIdList(@Param("workspaceIdList") List<UUID> workspaceIdList,
			@Param("userId") UUID userId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select p.priority, count(*) from taskboard_task p where p.priority is not null and "
			+ "p.status not in ( select tc.column_name from taskboard_columns tc where tc.column_order = "
			+ "(select max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.created_on between :startDate and :endDate and "
			+ "(case when exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id in :workspaceIdList) then (exists (select * from yoro_workspace_security x where "
			+ "x.workspace_id in :workspaceIdList and x.active_flag =:activeFlag and (x.owner_id =:userId))) "
			+ "else false end) group by p.priority", nativeQuery = true)
	public List<Object[]> getTaskByPriorityWithWorkspaceIdListWithDateFilter(
			@Param("workspaceIdList") List<UUID> workspaceIdList, @Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select count(*) from taskboard_task p where p.priority=:priority and p.status not "
			+ "in (select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = ( select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id) and w.active_flag = 'Y') or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = (select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id)) then (exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = ( select c.workspace_id from taskboard c where c.id = p.taskboard_id) and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) or (exists (select ts "
			+ "from taskboard_security ts where ts.active_flag =:activeFlag and ts.tenant_id =:tenantId and "
			+ "ts.taskboard_id = p.taskboard_id and (ts.user_id =:userId and ts.user_id is not null)))) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) group by p.priority", nativeQuery = true)
	public Long getPriorityTask(@Param("priority") String priority, @Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select count(*) from taskboard_task p where p.priority=:priority and p.status not "
			+ "in (select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.created_on between :startDate and :endDate and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = ( select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id) and w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = (select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id)) then (exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = ( select c.workspace_id from taskboard c where c.id = p.taskboard_id) and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) or (exists (select ts "
			+ "from taskboard_security ts where ts.active_flag =:activeFlag and ts.tenant_id =:tenantId and "
			+ "ts.taskboard_id = p.taskboard_id and (ts.user_id =:userId and ts.user_id is not null)))) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) group by p.priority", nativeQuery = true)
	public Long getPriorityTaskWithDateFilter(@Param("priority") String priority, @Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select count(*) from taskboard_task p where p.priority=:priority and p.status not "
			+ "in (select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.taskbaord_id in :taskboardIdList and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id in :workspaceIdList and "
			+ "w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id in :workspaceIdList) then "
			+ "(exists (select * from yoro_workspace_security x where x.workspace_id in :workspaceIdList and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end))) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) group by p.priority", nativeQuery = true)
	public Long getPriorityTaskByTaskboardIdListAndWorkspaceIdList(@Param("priority") String priority,
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("workspaceIdList") List<UUID> workspaceIdList,
			@Param("userId") UUID userId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select count(*) from taskboard_task p where p.priority=:priority and p.status not "
			+ "in (select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.created_on between :startDate and :endDate and p.taskbaord_id in :taskboardIdList and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id in :workspaceIdList and "
			+ "w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id in :workspaceIdList) then "
			+ "(exists (select * from yoro_workspace_security x where x.workspace_id in :workspaceIdList and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end))) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) group by p.priority", nativeQuery = true)
	public Long getPriorityTaskByTaskboardIdListAndWorkspaceIdListWithDateFilter(@Param("priority") String priority,
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("workspaceIdList") List<UUID> workspaceIdList,
			@Param("userId") UUID userId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select count(*) from taskboard_task p where p.priority=:priority and p.status not "
			+ "in (select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.taskbaord_id in :taskboardIdList  and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) group by p.priority", nativeQuery = true)
	public Long getPriorityTaskByTaskboardIdList(@Param("priority") String priority,
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select count(*) from taskboard_task p where p.priority=:priority and p.status not "
			+ "in (select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "p.created_on between :startDate and :endDate and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.taskbaord_id in :taskboardIdList  and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) group by p.priority", nativeQuery = true)
	public Long getPriorityTaskByTaskboardIdListWithDateFilter(@Param("priority") String priority,
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate);

	@Query(value = "select count(*) from taskboard_task p where p.priority=:priority and p.status not "
			+ "in (select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id in :workspaceIdList and "
			+ "w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id in :workspaceIdList) then "
			+ "(exists (select * from yoro_workspace_security x where x.workspace_id in :workspaceIdList and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end))) and "
			+ "exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) group by p.priority", nativeQuery = true)
	public Long getPriorityTaskByWorkspaceIdList(@Param("priority") String priority,
			@Param("workspaceIdList") List<UUID> workspaceIdList, @Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select count(*) from taskboard_task p where p.priority=:priority and p.status not "
			+ "in (select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.created_on between :startDate and :endDate and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id in :workspaceIdList and "
			+ "w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id in :workspaceIdList) then "
			+ "(exists (select * from yoro_workspace_security x where x.workspace_id in :workspaceIdList and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end))) and "
			+ "exists (select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) group by p.priority", nativeQuery = true)
	public Long getPriorityTaskByWorkspaceIdListWithDateFilter(@Param("priority") String priority,
			@Param("workspaceIdList") List<UUID> workspaceIdList, @Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select count(*) from taskboard_task p where p.priority is null and p.status not "
			+ "in (select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = ( select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id) and w.active_flag = 'Y') or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = (select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id)) then (exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = ( select c.workspace_id from taskboard c where c.id = p.taskboard_id) and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) or (exists (select ts "
			+ "from taskboard_security ts where ts.active_flag =:activeFlag and ts.tenant_id =:tenantId and "
			+ "ts.taskboard_id = p.taskboard_id and (ts.user_id =:userId and ts.user_id is not null)))) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) group by p.priority", nativeQuery = true)
	public Long getNoPriorityTask(@Param("userId") UUID userId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select count(*) from taskboard_task p where p.priority is null and p.status not "
			+ "in (select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.created_on between :startDate and :endDate and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = ( select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id) and w.active_flag = 'Y') or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = (select c.workspace_id from "
			+ "taskboard c where c.id = p.taskboard_id)) then (exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = ( select c.workspace_id from taskboard c where c.id = p.taskboard_id) and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) or (exists (select ts "
			+ "from taskboard_security ts where ts.active_flag =:activeFlag and ts.tenant_id =:tenantId and "
			+ "ts.taskboard_id = p.taskboard_id and (ts.user_id =:userId and ts.user_id is not null)))) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) group by p.priority", nativeQuery = true)
	public Long getNoPriorityTaskWithDateFilter(@Param("userId") UUID userId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate);

	@Query(value = "select count(*) from taskboard_task p where p.priority is null and p.status not "
			+ "in (select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.taskboard_id in :taskboardIdList and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id in :workspaceIdList and "
			+ "w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id in :workspaceIdList) then "
			+ "(exists (select * from yoro_workspace_security x where x.workspace_id in :workspaceIdList and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end))) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) group by p.priority", nativeQuery = true)
	public Long getNoPriorityTaskWithTaskboardIdListAndWorkspaceIdList(
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("workspaceIdList") List<UUID> workspaceIdList,
			@Param("userId") UUID userId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select count(*) from taskboard_task p where p.priority is null and p.status not "
			+ "in (select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.taskboard_id in :taskboardIdList and p.created_on between :startDate and :endDate and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id in :workspaceIdList and "
			+ "w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id in :workspaceIdList) then "
			+ "(exists (select * from yoro_workspace_security x where x.workspace_id in :workspaceIdList and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end))) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) group by p.priority", nativeQuery = true)
	public Long getNoPriorityTaskWithTaskboardIdListAndWorkspaceIdListWithDateFilter(
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("workspaceIdList") List<UUID> workspaceIdList,
			@Param("userId") UUID userId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select count(*) from taskboard_task p where p.priority is null and p.status not "
			+ "in (select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.taskboard_id in :taskboardIdList and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) group by p.priority", nativeQuery = true)
	public Long getNoPriorityTaskWithTaskboardIdList(@Param("taskboardIdList") List<UUID> taskboardIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select count(*) from taskboard_task p where p.priority is null and p.status not "
			+ "in (select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.created_on between :startDate and :endDate and p.taskboard_id in :taskboardIdList and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) group by p.priority", nativeQuery = true)
	public Long getNoPriorityTaskWithTaskboardIdListWithDateFilter(@Param("taskboardIdList") List<UUID> taskboardIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select count(*) from taskboard_task p where p.priority is null and p.status not "
			+ "in (select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id in :workspaceIdList and "
			+ "w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id in :workspaceIdList) then (exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id in :workspaceIdList and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end))) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) group by p.priority", nativeQuery = true)
	public Long getNoPriorityTaskWithWorkspaceIdList(@Param("workspaceIdList") List<UUID> workspaceIdList,
			@Param("userId") UUID userId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select count(*) from taskboard_task p where p.priority is null and p.status not "
			+ "in (select tc.column_name from taskboard_columns tc where tc.column_order = (select "
			+ "max(column_order) from taskboard_columns where taskboard_id = p.taskboard_id) and "
			+ "taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.created_on between :startDate and :endDate "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id in :workspaceIdList and "
			+ "w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id in :workspaceIdList) then (exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id in :workspaceIdList and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end))) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) group by p.priority", nativeQuery = true)
	public Long getNoPriorityTaskWithWorkspaceIdListWithDateFilter(@Param("workspaceIdList") List<UUID> workspaceIdList,
			@Param("userId") UUID userId, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select count(p) from taskboard_task p where p.tenant_id =:tenantId and p.active_flag "
			+ "=:activeFlag and p.due_date between :startDate and :endDate and p.status in (select "
			+ "tc.column_name from taskboard_columns tc where tc.column_order <> (select max(column_order) from "
			+ "taskboard_columns where taskboard_id = p.taskboard_id) and taskboard_id = p.taskboard_id) and "
			+ "exists ( select * from taskboard_columns t where t.taskboard_id = p.taskboard_id and "
			+ "p.status = t.column_name and t.active_flag =:activeFlag) and (exists (select * from "
			+ "taskboard_security ts where ts.taskboard_id = p.taskboard_id and ts.active_flag =:activeFlag and "
			+ "(ts.user_id =:userId)) or exists ( select * from taskboard t where t.id = p.taskboard_id and "
			+ "t.active_flag =:activeFlag and (exists ( select * from yoro_workspace w where "
			+ "w.workspace_id = t.workspace_id and w.active_flag =:activeFlag) or (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = t.workspace_id) then (exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = t.workspace_id and "
			+ "x.active_flag =:activeFlag and (x.owner_id=:userId))) else false end))))", nativeQuery = true)
	public int getTimeTrackingCountForAllWorkspace(@Param("userId") UUID userid, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate);

	@Query(value = "select count(p) from taskboard_task p where p.taskboard_id in :taskboardIdList and "
			+ "p.tenant_id =:tenantId and p.active_flag =:activeFlag and p.due_date between :startDate and :endDate "
			+ "and p.status in (select tc.column_name from taskboard_columns tc where "
			+ "tc.column_order <> (select max(column_order) from taskboard_columns where "
			+ "taskboard_id = p.taskboard_id) and taskboard_id = p.taskboard_id) and exists (select * from "
			+ "taskboard_columns t where t.taskboard_id = p.taskboard_id and p.status = t.column_name and "
			+ "t.active_flag =:activeFlag)", nativeQuery = true)
	public int getTimeTrackingCountByTaskboardIdList(@Param("taskboardIdList") List<UUID> taskboardIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query("select p from TaskboardTask p where p.taskType = 'parentTask' and p.createdBy=:userName"
			+ " and p.tenantId =:tenantId and p.activeFlag = :activeFlag"
			+ " and p.taskboard.workspaceId in :workspaceId and p.launchTaskData is not null")
	public List<TaskboardTask> getTaskboardTasksForLaunch(@Param("userName") String userName,
			@Param("workspaceId") List<UUID> workspaceId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, Pageable pageable);

	@Query("select p from TaskboardTask p where p.taskType = 'parentTask' and p.createdBy=:userName"
			+ " and p.tenantId =:tenantId and p.activeFlag = :activeFlag"
			+ " and p.taskboard.workspaceId in :workspaceId and p.launchTaskData is not null")
	public List<TaskboardTask> getTaskboardTasksForLaunchWithoutFilter(@Param("userName") String userName,
			@Param("workspaceId") List<UUID> workspaceId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select count(p) from TaskboardTask p where p.taskType = 'parentTask' and p.createdBy=:userName"
			+ " and p.tenantId =:tenantId and p.activeFlag = :activeFlag"
			+ " and p.taskboard.workspaceId in :workspaceId and p.launchTaskData is not null")
	public Integer getTaskboardTasksForLaunchCount(@Param("userName") String userName,
			@Param("workspaceId") List<UUID> workspaceId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select p from TaskboardTask p where p.tenantId =:tenantId and "
			+ "p.activeFlag = :activeFlag and p.taskboard.workspaceId =:workspaceId "
			+ "and p.taskboard.id=:taskboardId and p.status <> 'Archived'")
	public List<TaskboardTask> getTaskForExcel(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("taskboardId") UUID taskboardId,
			@Param("workspaceId") UUID workspaceId);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, "
			+ "cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId, u.first_name as firstName, u.last_name as lastName, "
			+ " u.color as color from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId left join users as u on "
			+ " u.user_id = ttau.user_id  where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order <> (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , "
			+ "ttc.id, ttf.id, u.first_name, u.last_name, u.color order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTaskListByAssignee(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select "
			+ " tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId, u.first_name as firstName, u.last_name as lastName,u.color as color "
			+ " from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId left join users as u on "
			+ " u.user_id = ttau.user_id  where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order <> (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id, "
			+ " u.first_name, u.last_name, u.color "
			+ " order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTaskListByAssigneeForSprint(@Param("taskboardId") UUID taskboardId,
			@Param("sprintId") UUID sprintId, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select count(*) from taskboard_task p where p.priority=:priority and "
			+ "p.status in ( select tc.column_name from taskboard_columns tc where tc.column_order <> "
			+ "(select max(column_order) from taskboard_columns tbc where tbc.taskboard_id = p.taskboard_id) and "
			+ "tc.taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.taskboard_id =:taskboardId group by p.priority", nativeQuery = true)
	public Long getGroupByPriorityCount(@Param("priority") String priority, @Param("taskboardId") UUID taskboardId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select count(*) from taskboard_task p where p.priority is null and "
			+ "p.status in ( select tc.column_name from taskboard_columns tc where tc.column_order <> "
			+ "(select max(column_order) from taskboard_columns tbc where tbc.taskboard_id = p.taskboard_id) and "
			+ "tc.taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.taskboard_id =:taskboardId group by p.priority", nativeQuery = true)
	public Long getGroupByNoPriorityCount(@Param("taskboardId") UUID taskboardId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select count(*) from taskboard_task p where p.priority=:priority and "
			+ "p.status in ( select tc.column_name from taskboard_columns tc where tc.column_order <> "
			+ "(select max(column_order) from taskboard_columns tbc where tbc.taskboard_id = p.taskboard_id) and "
			+ "tc.taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.taskboard_id =:taskboardId and exists (select 1 from taskboard_sprint_tasks x where "
			+ "p.id = x.taskboard_task_id and x.sprints_id =:sprintId "
			+ "and x.active_flag =:activeFlag) group by p.priority", nativeQuery = true)
	public Long getGroupBySprintPriorityCount(@Param("priority") String priority,
			@Param("taskboardId") UUID taskboardId, @Param("sprintId") UUID sprintId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select count(*) from taskboard_task p where p.priority is null and "
			+ "p.status in ( select tc.column_name from taskboard_columns tc where tc.column_order <> "
			+ "(select max(column_order) from taskboard_columns tbc where tbc.taskboard_id = p.taskboard_id) and "
			+ "tc.taskboard_id = p.taskboard_id) and p.tenant_id =:tenantId and p.active_flag =:activeFlag and "
			+ "p.taskboard_id =:taskboardId and exists (select 1 from taskboard_sprint_tasks x where "
			+ "p.id = x.taskboard_task_id and x.sprints_id =:sprintId and x.active_flag =:activeFlag) "
			+ "group by p.priority", nativeQuery = true)
	public Long getGroupByNoSprintPriorityCount(@Param("taskboardId") UUID taskboardId,
			@Param("sprintId") UUID sprintId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, "
			+ "cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId, u.first_name as firstName, u.last_name as lastName, "
			+ " u.color as color from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId left join users as u on "
			+ " u.user_id = ttau.user_id  where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " p.status =:status and (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , "
			+ "ttc.id, ttf.id, u.first_name, u.last_name, u.color order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTaskListByStatus(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, @Param("status") String status);

	@Query(value = "select "
			+ " tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and p.status =:status and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTaskListByStatusForSprint(@Param("taskboardId") UUID taskboardId,
			@Param("sprintId") UUID sprintId, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("status") String status);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, "
			+ "cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId, u.first_name as firstName, u.last_name as lastName, "
			+ " u.color as color from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId left join users as u on "
			+ " u.user_id = ttau.user_id  where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " p.priority =:priority and (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , "
			+ "ttc.id, ttf.id, u.first_name, u.last_name, u.color order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTaskListByPriority(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("priority") String priority);

	@Query(value = "select "
			+ " tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and p.priority =:priority and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTaskListByPriorityForSprint(@Param("taskboardId") UUID taskboardId,
			@Param("sprintId") UUID sprintId, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("priority") String priority);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, "
			+ "cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId, u.first_name as firstName, u.last_name as lastName, "
			+ " u.color as color from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId left join users as u on "
			+ " u.user_id = ttau.user_id  where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " p.priority is null and (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , "
			+ "ttc.id, ttf.id, u.first_name, u.last_name, u.color order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTaskListByNoPriority(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select "
			+ " tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and p.priority is null and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardTaskListByNoPriorityForSprint(@Param("taskboardId") UUID taskboardId,
			@Param("sprintId") UUID sprintId, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order <> (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) "
			+ " and p.created_on between :startDate and :endDate and"
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardInitialTaskListWithCreatedDateFilter(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select "
			+ " tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order <> (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) and "
			+ " p.created_on between :startDate and :endDate and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardInitialTaskListBySprintWithCreatedDateFilter(
			@Param("taskboardId") UUID taskboardId, @Param("sprintId") UUID sprintId, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate);


	@Query(" select  new com.yorosis.yoroflow.repository.PendingTaskBoardTasksDTO(tt.id,tt.taskId ,t.taskboardKey,t.id, w.workspaceUniqueId) from Taskboard t, TaskboardTask tt,TaskboardColumns tc,Workspace w"
			+ " where tt.dueDate is not null and ((tt.dueDate <= :today) OR tt.dueDate < :tomorrow) "
			+ "	and (tt.nextReminderTimestamp is null OR DATE(tt.nextReminderTimestamp) < DATE(:today))"
			+ "	and tc.isDoneColumn = 'N' and tt.status = tc.columnName and tc.activeFlag = 'Y' and tt.activeFlag = 'Y' and "
			+ " tt.taskboard.id = tc.taskboard.id and tt.taskboard.id = t.id and tt.tenantId = t.tenantId and "
			+ "	tt.tenantId = tc.tenantId and t.tenantId = w.tenantId and w.tenantId = :tenantId and w.id = tt.taskboard.workspaceId"
			+ " and  exists (select  1 from TaskboardTaskAssignedUsers ttau where ttau.taskboardTask.id = tt.id) ")
	public List<PendingTaskBoardTasksDTO> findTasksforTaskBoardIdsPastDueDateWithAssignedUsers(@Param("tenantId") String tenantId,
			@Param("today") Timestamp todayDate, @Param("tomorrow") Timestamp tomorrow);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order <> (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) "
			+ " and p.start_date between :startDate and :endDate and"
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardInitialTaskListWithStartDateFilter(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select "
			+ " tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order <> (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) and "
			+ " p.start_date between :startDate and :endDate and"
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardInitialTaskListBySprintWithStartDateFilter(
			@Param("taskboardId") UUID taskboardId, @Param("sprintId") UUID sprintId, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate);

	@Query(value = "select "
			+ "tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order <> (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) "
			+ " and p.due_date between :startDate and :endDate and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardInitialTaskListWithDueDateFilter(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select "
			+ " tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order <> (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) and "
			+ " p.due_date between :startDate and :endDate and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public List<TaskEntityVO> getTaskboardInitialTaskListBySprintWithDueDateFilter(
			@Param("taskboardId") UUID taskboardId, @Param("sprintId") UUID sprintId, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate);

	@Query(value = "select tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order = (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) and "
			+ " p.created_on between :startDate and :endDate and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public Set<TaskEntityVO> getTaskboardTaskListForDoneColumnWithCreatedDateFilter(
			@Param("taskboardId") UUID taskboardId, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate);

	@Query(value = "select tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order = (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) and "
			+ " p.due_date between :startDate and :endDate and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public Set<TaskEntityVO> getTaskboardTaskListForDoneColumnWithDueDateFilter(@Param("taskboardId") UUID taskboardId,
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order = (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) and "
			+ " p.start_date between :startDate and :endDate and "
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public Set<TaskEntityVO> getTaskboardTaskListForDoneColumnWithStartDateFilter(
			@Param("taskboardId") UUID taskboardId, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate);

	@Query(value = "select tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order = (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) and "
			+ " p.created_on between :startDate and :endDate and"
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and"
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public Set<TaskEntityVO> getTaskboardTaskListForDoneColumnBySprintWithCreatedDateFilter(
			@Param("taskboardId") UUID taskboardId, @Param("sprintId") UUID sprintId, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate);

	@Query(value = "select tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order = (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) and "
			+ " p.start_date between :startDate and :endDate and"
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and"
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public Set<TaskEntityVO> getTaskboardTaskListForDoneColumnBySprintWithStartDateFilter(
			@Param("taskboardId") UUID taskboardId, @Param("sprintId") UUID sprintId, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate);

	@Query(value = "select tbc.column_order as columnOrder , tbc.column_name as columnName, cast(p.id as varchar) as id,"
			+ " cast(p.taskboard_id as varchar) as taskboardId,"
			+ " p.start_date as startDate, p.due_date as dueDate, p.status as status,"
			+ " p.task_name as taskName, p.task_type as taskType, cast(p.parent_task_id as varchar) as parentTaskId , "
			+ " cast(p.task_data as varchar) as taskData, "
			+ " p.task_id as taskId, p.description as description, p.sequence_no as sequenceNo, p.sub_status as subStatus,"
			+ " p.previous_status as previousStatus, p.priority as priority, p.created_by as createdBy,p.created_on as createdOn"
			+ " , p.modified_by as modifiedBy , p.modified_on as modifiedOn, cast(ttc.id as varchar) as commentId,"
			+ " cast(ttc.taskboard_task_id as varchar) as commentsTaskId, cast(ttf.id as varchar) as filesId,"
			+ "  cast(ttf.taskboard_task_id as varchar) as filesTaskId , ttl.label_name as labelName, cast(tbl.id as varchar) as labelId, tbl.label_color as labelColor, "
			+ " cast(ttl.id as varchar) as taskLabelId, cast(ttau.id as varchar) as assignedId, "
			+ " cast(ttau.user_id as varchar) as userId from taskboard_columns as tbc, "
			+ " taskboard_task as p left join taskboard_task_labels as ttl on ttl.taskboard_task_id = p.id and "
			+ " ttl.active_flag = :activeFlag and ttl.tenant_id = :tenantId left join taskboard_labels as tbl on "
			+ " tbl.taskboard_id = p.taskboard_id and tbl.id = ttl.taskboard_labels_id and tbl.active_flag = :activeFlag and "
			+ " tbl.tenant_id = :tenantId left join taskboard_task_assigned_users as ttau on"
			+ "	ttau.taskboard_task_id = p.id and ttau.active_flag = :activeFlag and ttau.tenant_id = :tenantId left join"
			+ " taskboard_task_comments as ttc on"
			+ "	ttc.taskboard_task_id = p.id and ttc.active_flag = :activeFlag and ttc.tenant_id = :tenantId "
			+ " left join taskboard_task_files as ttf on ttf.taskboard_task_id = p.id and ttf.active_flag = :activeFlag"
			+ "	and ttf.tenant_id = :tenantId   where (p.taskboard_id=:taskboardId and p.tenant_id =:tenantId and "
			+ " p.active_flag = :activeFlag and tbc.column_name = p.status and tbc.taskboard_id = p.taskboard_id and "
			+ " p.status in (select tc.column_name from taskboard_columns tc where tc.column_order = (SELECT MAX(column_order) FROM "
			+ " taskboard_columns where taskboard_id=:taskboardId) and taskboard_id=:taskboardId) and "
			+ " p.due_date between :startDate and :endDate and"
			+ " exists (select 1 from taskboard_sprint_tasks x where p.id = x.taskboard_task_id and "
			+ " x.sprints_id =:sprintId and x.active_flag = :activeFlag) and"
			+ " (case when exists (select 1 from taskboard_task_assigned_users x where "
			+ " x.taskboard_task_id = p.id and x.active_flag=:activeFlag) then (exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId)) or "
			+ " exists (select 1 from taskboard_task_assigned_users x where (x.taskboard_task_id = p.id and "
			+ " (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ " else exists (select 1 from taskboard_security ts where ts.taskboard_id = p.taskboard_id and "
			+ " ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end)) group by "
			+ " tbc.column_order, tbc.column_name, p.id, ttl.label_name, tbl.id, ttl.id, ttau.id , ttc.id, ttf.id order by tbc.column_order, subStatus, sequenceNo", nativeQuery = true)
	public Set<TaskEntityVO> getTaskboardTaskListForDoneColumnBySprintWithDueDateFilter(
			@Param("taskboardId") UUID taskboardId, @Param("sprintId") UUID sprintId, @Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate);

}
