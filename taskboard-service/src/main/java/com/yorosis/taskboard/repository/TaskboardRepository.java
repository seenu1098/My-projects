package com.yorosis.taskboard.repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.models.TaskboardEntityVO;
import com.yorosis.taskboard.taskboard.entities.Taskboard;

public interface TaskboardRepository extends JpaRepository<Taskboard, UUID> {

	public Taskboard findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id, String tenantId, String activeFlag);

	@Query("select t from Taskboard t where t.id =:id and t.activeFlag = :activeFlag and t.tenantId = :tenantId")
	public Taskboard getTaskboardByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id, String tenantId,
			String activeFlag);

	@Query("select t from Taskboard t where t.workspaceId =:workspaceId and t.activeFlag = :activeFlag and t.tenantId = :tenantId order by LOWER(t.name) asc")
	public List<Taskboard> getTaskBoardListByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String tenantId,
			String activeFlag, @Param("workspaceId") UUID workspaceId);

	@Query("select t from Taskboard t where t.activeFlag = :activeFlag and t.tenantId = :tenantId order by LOWER(t.name) asc")
	public List<Taskboard> getTaskBoardListByTenantIdIgnoreCaseAndActiveFlagIgnoreCaseWithoutWorkspace(String tenantId,
			String activeFlag);

	public List<Taskboard> findByNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String name, String tenantId,
			String activeFlag);

	public Taskboard findByTaskboardKeyAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String taskboardKey,
			String tenantId, String activeFlag);

	@Query("select t from Taskboard t where t.workspaceId =:workspaceId and t.activeFlag = :activeFlag and t.tenantId = :tenantId and "
			+ " exists (select ts from TaskboardSecurity ts where ts.activeFlag = :activeFlag and ts.tenantId = :tenantId"
			+ " and ts.taskboard.id = t.id and (ts.userId=:userId or ts.groupId in :groupIdList)) order by LOWER(t.name) asc")
	public List<Taskboard> getTaskBoardListByTenantIdIgnoreCaseAndActiveFlagIgnoreCaseWithPermission(
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("workspaceId") UUID workspaceId);

	@Query("select count(t) from Taskboard t where t.workspaceId =:workspaceId and t.activeFlag = :activeFlag and t.tenantId = :tenantId")
	public int getTotalTaskBoardCount(String tenantId, String activeFlag, @Param("workspaceId") UUID workspaceId);

	@Query("select count(t) from Taskboard t where t.activeFlag = :activeFlag and t.tenantId = :tenantId")
	public int getTotalTaskBoardCount(String tenantId, String activeFlag);

	@Query("select count(t) from Taskboard t where t.activeFlag = :activeFlag and t.tenantId = :tenantId")
	public int getTotalTaskBoardCountForLicence(String tenantId, String activeFlag);

	@Query(value = "select cast(tb.id as varchar) as taskboardId, tb.name as taskboardName ,tb.description as taskboardDescription,"
			+ " tb.generated_task_id as generatedTaskId, tb.sprint_enabled as sprintEnabled, tb.task_name as taskName, tb.taskboard_key as taskboardKey,"
			+ " tb.is_column_background as taskboardIsColumnBackground, "
			+ "tbl.label_name as labelName, tbl.label_color as labelColor, cast(tbl.id as varchar) as taskboardLabelId, "
			+ "tc.column_name as columnName, tc.column_order as columnOrder, tc.form_id as formId, "
			+ "cast(tc.id as varchar) as taskboardColumnId, tc.version as version, tc.is_done_column as isDoneColumn, "
			+ "tc.column_color as columnColor, tc.layout_type as layoutType, tc.is_column_background as isColumnBackground,"
			+ " cast(tss.taskboard_column_id as varchar) as subStatusColumnId ,tss.sub_status_name as subStatusName, tss.sub_status_color as subStatusColor, "
			+ "cast(tss.id as varchar) as subStatusId, tss.column_order as subStatusColumnOrder, cast(ts.user_id as varchar)"
			+ " as userId, tb.launch_button_name as launchButtonName, cast(tb.initial_map_data as varchar) as initialMapData from taskboard as tb left join taskboard_security as ts on"
			+ "	ts.taskboard_id = tb.id and ts.active_flag =:activeFlag and ts.tenant_id =:tenantId left join"
			+ " taskboard_labels as tbl on tbl.taskboard_id = tb.id "
			+ "and tbl.active_flag =:activeFlag and tbl.tenant_id =:tenantId , taskboard_columns as tc left join  "
			+ "taskboard_sub_status as tss on tss.taskboard_column_id = tc.id and tss.active_flag =:activeFlag and  "
			+ "tss.tenant_id =:tenantId where (tb.id =:taskboardId and tc.taskboard_id = tb.id and "
			+ "tc.tenant_id =:tenantId and tc.active_flag =:activeFlag and tb.tenant_id =:tenantId and"
			+ " tb.active_flag =:activeFlag) group by "
			+ "tb.id, tc.id, tss.id, tbl.id, tbl.label_name, ts.user_id order by tb.id", nativeQuery = true)
	public List<TaskboardEntityVO> getTaskboardInfo(@Param("taskboardId") UUID taskboardId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select t.workspaceId, count(t) from Taskboard t where t.activeFlag = :activeFlag and t.tenantId = :tenantId and "
			+ " exists (select ts from TaskboardSecurity ts where ts.activeFlag = :activeFlag and ts.tenantId = :tenantId"
			+ " and ts.taskboard.id = t.id and (ts.userId=:userId or ts.groupId in :groupIdList)) GROUP BY t.workspaceId")
	public List<Object[]> getTaskBoardNameListByTenantIdIgnoreCaseAndActiveFlagIgnoreCaseWithPermission(
			@Param("userId") UUID userId, @Param("groupIdList") List<UUID> groupIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select t.workspaceId, count(t) from Taskboard t where t.activeFlag = :activeFlag and t.tenantId = :tenantId "
			+ " GROUP BY t.workspaceId")
	public List<Object[]> getTaskBoardNameListByTenantIdIgnoreCaseAndActiveFlagIgnoreCaseWithoutPermission(
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select t from Taskboard t where t.id =:id and t.activeFlag = :activeFlag and t.tenantId = :tenantId order by LOWER(t.name) asc")
	public List<Taskboard> getTaskBoardListByTenantIdIgnoreCaseAndActiveFlagIgnoreCaseForInstall(String tenantId,
			String activeFlag, @Param("id") List<UUID> id);

	@Query("select t.name from Taskboard t where t.workspaceId =:workspaceId and t.activeFlag = :activeFlag and t.tenantId = :tenantId order by LOWER(t.name) asc")
	public List<String> getTaskBoardNameListByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(String tenantId,
			String activeFlag, @Param("workspaceId") UUID workspaceId);

	@Query(value = "select tb.column_name, sum(case when tt.status = tb.column_name then 1 else 0 end), tb.column_color from "
			+ "taskboard as t left join taskboard_columns as tb on tb.taskboard_id = t.id and "
			+ "tb.active_flag =:activeFlag and tb.tenant_id =:tenantId left join taskboard_task as tt on "
			+ "tt.taskboard_id = tb.taskboard_id and tt.active_flag =:activeFlag and tt.tenant_id =:tenantId and "
			+ "tt.task_type = 'parentTask' "
			+ "where ((exists ( select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and (x.owner_id =:userId))) "
			+ "else false end)) or (exists ( select ts from taskboard_security ts where ts.active_flag =:activeFlag "
			+ "and ts.tenant_id =:tenantId and ts.taskboard_id = t.id and (ts.user_id =:userId)))) and "
			+ "t.active_flag =:activeFlag and t.tenant_id =:tenantId group by tb.column_name,tb.column_color order by "
			+ "tb.column_name", nativeQuery = true)
	public List<Object[]> getWorkloadByStatusWithoutFilter(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select tb.column_name, sum(case when tt.status = tb.column_name then 1 else 0 end), tb.column_color from "
			+ "taskboard as t left join taskboard_columns as tb on tb.taskboard_id = t.id and "
			+ "tb.active_flag =:activeFlag and tb.tenant_id =:tenantId left join taskboard_task as tt on "
			+ "tt.taskboard_id = tb.taskboard_id and tt.active_flag =:activeFlag and tt.tenant_id =:tenantId and "
			+ "tt.task_type = 'parentTask' and tt.created_on between :startDate and :endDate "
			+ "where ((exists ( select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and (x.owner_id =:userId))) "
			+ "else false end)) or (exists ( select ts from taskboard_security ts where ts.active_flag =:activeFlag "
			+ "and ts.tenant_id =:tenantId and ts.taskboard_id = t.id and (ts.user_id =:userId)))) and "
			+ "t.active_flag =:activeFlag and t.tenant_id =:tenantId group by tb.column_name,tb.column_color order by "
			+ "tb.column_name", nativeQuery = true)
	public List<Object[]> getWorkloadByStatusWithDateFilter(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select tb.column_name, sum(case when tt.status = tb.column_name then 1 else 0 end), tb.column_color from "
			+ "taskboard as t left join taskboard_columns as tb on tb.taskboard_id = t.id and "
			+ "tb.active_flag =:activeFlag and tb.tenant_id =:tenantId left join taskboard_task as tt on "
			+ "tt.taskboard_id = tb.taskboard_id and tt.task_type = 'parentTask' and tt.tenant_id =:tenantId and "
			+ "tt.active_flag =:activeFlag where ((exists ( select * from yoro_workspace w where "
			+ "w.workspace_id = t.workspace_id and w.active_flag =:activeFlag) or (case when exists "
			+ "( select * from yoro_workspace_security x where x.workspace_id = t.workspace_id) then (exists "
			+ "( select * from yoro_workspace_security x where x.workspace_id = t.workspace_id and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) or (exists "
			+ "( select ts from taskboard_security ts where ts.active_flag =:activeFlag and ts.tenant_id =:tenantId "
			+ "and ts.taskboard_id = t.id and (ts.user_id =:userId)))) and t.active_flag =:activeFlag and "
			+ "t.tenant_id =:tenantId and t.workspace_id in :workspaceIdList group by tb.column_name,tb.column_color order by "
			+ "tb.column_name", nativeQuery = true)
	public List<Object[]> getWorkloadByStatusByWorkspaceIdList(@Param("workspaceIdList") List<UUID> workspaceIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select tb.column_name, sum(case when tt.status = tb.column_name then 1 else 0 end), tb.column_color from "
			+ "taskboard as t left join taskboard_columns as tb on tb.taskboard_id = t.id and "
			+ "tb.active_flag =:activeFlag and tb.tenant_id =:tenantId left join taskboard_task as tt on "
			+ "tt.taskboard_id = tb.taskboard_id and tt.task_type = 'parentTask' and tt.tenant_id =:tenantId and "
			+ "tt.active_flag =:activeFlag and tt.created_on between :startDate and :endDate where ((exists ( select * from yoro_workspace w where "
			+ "w.workspace_id = t.workspace_id and w.active_flag =:activeFlag) or (case when exists "
			+ "( select * from yoro_workspace_security x where x.workspace_id = t.workspace_id) then (exists "
			+ "( select * from yoro_workspace_security x where x.workspace_id = t.workspace_id and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) or (exists "
			+ "( select ts from taskboard_security ts where ts.active_flag =:activeFlag and ts.tenant_id =:tenantId "
			+ "and ts.taskboard_id = t.id and (ts.user_id =:userId)))) and t.active_flag =:activeFlag and "
			+ "t.tenant_id =:tenantId and t.workspace_id in :workspaceIdList group by tb.column_name,tb.column_color order by "
			+ "tb.column_name", nativeQuery = true)
	public List<Object[]> getWorkloadByStatusByWorkspaceIdListWithDateFilter(
			@Param("workspaceIdList") List<UUID> workspaceIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate);

	@Query(value = "select tb.column_name, sum(case when tt.status = tb.column_name then 1 else 0 end), tb.column_color from "
			+ "taskboard as t left join taskboard_columns as tb on tb.taskboard_id = t.id and "
			+ "tb.active_flag =:activeFlag and tb.tenant_id =:tenantId left join taskboard_task as tt on "
			+ "tt.taskboard_id = tb.taskboard_id and tt.active_flag =:activeFlag and tt.tenant_id =:tenantId "
			+ "and tt.task_type = 'parentTask'"
			+ "where ((exists ( select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and (x.owner_id =:userId))) "
			+ "else false end)) or (exists ( select ts from taskboard_security ts where ts.active_flag =:activeFlag "
			+ "and ts.tenant_id =:tenantId and ts.taskboard_id = t.id and (ts.user_id =:userId)))) "
			+ "and t.id in :taskboardIdList and t.active_flag =:activeFlag and t.tenant_id =:tenantId "
			+ "group by tb.column_name,tb.column_color order by tb.column_name", nativeQuery = true)
	public List<Object[]> getWorkloadByStatusByWorkspaceIdWithTaskboardIdList(@Param("userId") UUID userId,
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select tb.column_name, sum(case when tt.status = tb.column_name then 1 else 0 end), tb.column_color from "
			+ "taskboard as t left join taskboard_columns as tb on tb.taskboard_id = t.id and "
			+ "tb.active_flag =:activeFlag and tb.tenant_id =:tenantId left join taskboard_task as tt on "
			+ "tt.taskboard_id = tb.taskboard_id and tt.active_flag =:activeFlag and tt.tenant_id =:tenantId "
			+ "and tt.task_type = 'parentTask' and tt.created_on between :startDate and :endDate "
			+ "where ((exists ( select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and (x.owner_id =:userId))) "
			+ "else false end)) or (exists ( select ts from taskboard_security ts where ts.active_flag =:activeFlag "
			+ "and ts.tenant_id =:tenantId and ts.taskboard_id = t.id and (ts.user_id =:userId)))) "
			+ "and t.id in :taskboardIdList and t.active_flag =:activeFlag and t.tenant_id =:tenantId "
			+ "group by tb.column_name,tb.column_color order by tb.column_name", nativeQuery = true)
	public List<Object[]> getWorkloadByStatusByWorkspaceIdWithTaskboardIdListAndDateFilter(@Param("userId") UUID userId,
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate);

	@Query(value = "select tb.column_name, sum(case when tt.status = tb.column_name then 1 else 0 end), tb.column_color from "
			+ "taskboard as t left join taskboard_columns as tb on tb.taskboard_id = t.id and "
			+ "tb.active_flag =:activeFlag and tb.tenant_id =:tenantId left join taskboard_task as tt on "
			+ "tt.taskboard_id = tb.taskboard_id and tt.task_type = 'parentTask' and tt.tenant_id =:tenantId and "
			+ "tt.active_flag =:activeFlag where ((exists ( select * from yoro_workspace w where "
			+ "w.workspace_id = t.workspace_id and w.active_flag =:activeFlag) or (case when exists "
			+ "( select * from yoro_workspace_security x where x.workspace_id = t.workspace_id) then (exists "
			+ "( select * from yoro_workspace_security x where x.workspace_id = t.workspace_id and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) or (exists "
			+ "( select ts from taskboard_security ts where ts.active_flag =:activeFlag and "
			+ "ts.tenant_id =:tenantId and ts.taskboard_id = t.id and (ts.user_id =:userId)))) and "
			+ "t.active_flag =:activeFlag and t.tenant_id =:tenantId and t.workspace_id in :workspaceIdList "
			+ "and t.id in :taskboardIdList group by tb.column_name,tb.column_color order by tb.column_name", nativeQuery = true)
	public List<Object[]> getWorkloadByStatusByWorkspaceIdListandTaskboardIdList(
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("workspaceIdList") List<UUID> workspaceIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select tb.column_name, sum(case when tt.status = tb.column_name then 1 else 0 end), tb.column_color from "
			+ "taskboard as t left join taskboard_columns as tb on tb.taskboard_id = t.id and "
			+ "tb.active_flag =:activeFlag and tb.tenant_id =:tenantId left join taskboard_task as tt on "
			+ "tt.taskboard_id = tb.taskboard_id and tt.task_type = 'parentTask' and tt.tenant_id =:tenantId and "
			+ "tt.active_flag =:activeFlag and tt.created_on between :startDate and :endDate where ((exists ( select * from yoro_workspace w where "
			+ "w.workspace_id = t.workspace_id and w.active_flag =:activeFlag) or (case when exists "
			+ "( select * from yoro_workspace_security x where x.workspace_id = t.workspace_id) then (exists "
			+ "( select * from yoro_workspace_security x where x.workspace_id = t.workspace_id and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) or (exists "
			+ "( select ts from taskboard_security ts where ts.active_flag =:activeFlag and "
			+ "ts.tenant_id =:tenantId and ts.taskboard_id = t.id and (ts.user_id =:userId)))) and "
			+ "t.active_flag =:activeFlag and t.tenant_id =:tenantId and t.workspace_id in :workspaceIdList "
			+ "and t.id in :taskboardIdList group by tb.column_name,tb.column_color order by tb.column_name", nativeQuery = true)
	public List<Object[]> getWorkloadByStatusByWorkspaceIdListandTaskboardIdListWithDateFilter(
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("workspaceIdList") List<UUID> workspaceIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select u.first_name, u.last_name, sum(case when ttau.taskboard_task_id = tt.id and "
			+ "u.user_id = ttau.user_id then 1 else 0 end), u.color from users as u, taskboard as t left join "
			+ "taskboard_columns as tb on tb.taskboard_id = t.id and tb.active_flag =:activeFlag and "
			+ "tb.tenant_id =:tenantId left join taskboard_task as tt on tt.taskboard_id = t.id and "
			+ "tt.status = tb.column_name and tt.active_flag =:activeFlag left join "
			+ "taskboard_task_assigned_users as ttau on ttau.taskboard_task_id = tt.id and "
			+ "ttau.active_flag =:activeFlag and ttau.tenant_id =:tenantId where ((exists "
			+ "( select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and (x.owner_id =:userId))) "
			+ "else false end)) or exists ( select * from taskboard_security ts where ts.taskboard_id = t.id "
			+ "and ts.active_flag =:activeFlag and (ts.user_id =:userId) and exists ( select * from "
			+ "taskboard_columns t where t.taskboard_id = t.id and t.active_flag =:activeFlag))) and "
			+ "tb.taskboard_id = t.id and t.active_flag =:activeFlag and t.tenant_id =:tenantId group by "
			+ "u.first_name, u.last_name, u.color order by u.first_name, u.last_name", nativeQuery = true)
	public List<Object[]> getTaskByAssigneeWithoutFilter(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select u.first_name, u.last_name, sum(case when ttau.taskboard_task_id = tt.id and "
			+ "u.user_id = ttau.user_id then 1 else 0 end), u.color from users as u, taskboard as t left join "
			+ "taskboard_columns as tb on tb.taskboard_id = t.id and tb.active_flag =:activeFlag and "
			+ "tb.tenant_id =:tenantId left join taskboard_task as tt on tt.taskboard_id = t.id and "
			+ "tt.status = tb.column_name and tt.active_flag =:activeFlag and tt.created_on "
			+ "between :startDate and :endDate left join "
			+ "taskboard_task_assigned_users as ttau on ttau.taskboard_task_id = tt.id and "
			+ "ttau.active_flag =:activeFlag and ttau.tenant_id =:tenantId where ((exists "
			+ "( select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and (x.owner_id =:userId))) "
			+ "else false end)) or exists ( select * from taskboard_security ts where ts.taskboard_id = t.id "
			+ "and ts.active_flag =:activeFlag and (ts.user_id =:userId) and exists ( select * from "
			+ "taskboard_columns t where t.taskboard_id = t.id and t.active_flag =:activeFlag))) and "
			+ "tb.taskboard_id = t.id and t.active_flag =:activeFlag and t.tenant_id =:tenantId group by "
			+ "u.first_name, u.last_name, u.color order by u.first_name, u.last_name", nativeQuery = true)
	public List<Object[]> getTaskByAssigneeByDateWithoutFilter(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select u.first_name, u.last_name, sum(case when ttau.taskboard_task_id = tt.id and "
			+ "u.user_id = ttau.user_id then 1 else 0 end), u.color from users as u, taskboard as t left join "
			+ "taskboard_columns as tb on tb.taskboard_id = t.id and tb.active_flag =:activeFlag and "
			+ "tb.tenant_id =:tenantId left join taskboard_task as tt on tt.taskboard_id = t.id and "
			+ "tt.status = tb.column_name and tb.active_flag =:activeFlag left join "
			+ "taskboard_task_assigned_users as ttau on ttau.taskboard_task_id = tt.id and "
			+ "tb.active_flag =:activeFlag and tb.tenant_id =:tenantId where "
			+ "t.workspace_id in :workspaceIdList and tb.taskboard_id = t.id and t.active_flag =:activeFlag and t.tenant_id =:tenantId "
			+ "group by u.first_name, u.last_name, u.color order by u.first_name, u.last_name", nativeQuery = true)
	public List<Object[]> getTaskByAssigneeByWorkspaceIdList(@Param("workspaceIdList") List<UUID> workspaceIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select u.first_name, u.last_name, sum(case when ttau.taskboard_task_id = tt.id and "
			+ "u.user_id = ttau.user_id then 1 else 0 end), u.color from users as u, taskboard as t left join "
			+ "taskboard_columns as tb on tb.taskboard_id = t.id and tb.active_flag =:activeFlag and "
			+ "tb.tenant_id =:tenantId left join taskboard_task as tt on tt.taskboard_id = t.id and "
			+ "tt.status = tb.column_name and tt.active_flag =:activeFlag and tt.created_on "
			+ "between :startDate and :endDate left join "
			+ "taskboard_task_assigned_users as ttau on ttau.taskboard_task_id = tt.id and "
			+ "tb.active_flag =:activeFlag and tb.tenant_id =:tenantId where "
			+ "t.workspace_id in :workspaceIdList and tb.taskboard_id = t.id and t.active_flag =:activeFlag and t.tenant_id =:tenantId "
			+ "group by u.first_name, u.last_name, u.color order by u.first_name, u.last_name", nativeQuery = true)
	public List<Object[]> getTaskByAssigneeByWorkspaceIdListWithDateFilter(
			@Param("workspaceIdList") List<UUID> workspaceIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate);

	@Query(value = "select u.first_name, u.last_name, sum(case when ttau.taskboard_task_id = tt.id and "
			+ "u.user_id = ttau.user_id then 1 else 0 end), u.color from users as u, taskboard as t left join "
			+ "taskboard_columns as tb on tb.taskboard_id = t.id and tb.active_flag =:activeFlag and "
			+ "tb.tenant_id =:tenantId left join taskboard_task as tt on tt.taskboard_id = t.id and "
			+ "tt.status = tb.column_name and tb.active_flag =:activeFlag left join "
			+ "taskboard_task_assigned_users as ttau on ttau.taskboard_task_id = tt.id and "
			+ "tb.active_flag =:activeFlag and tb.tenant_id =:tenantId where ((exists "
			+ "( select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and "
			+ "(x.owner_id =:userId))) else false end)) or exists (select * from taskboard_security ts "
			+ "where ts.taskboard_id = t.id and ts.active_flag =:activeFlag and (ts.user_id =:userId) and "
			+ "exists (select * from taskboard_columns t where t.taskboard_id = t.id and "
			+ "t.active_flag =:activeFlag))) and t.id in :taskboardIdList and t.active_flag =:activeFlag and "
			+ "t.tenant_id =:tenantId group by u.first_name, u.last_name, u.color order by u.first_name, "
			+ "u.last_name", nativeQuery = true)
	public List<Object[]> getTaskByAssigneeByWorkspaceIdWithTaskboardIdList(@Param("userId") UUID userId,
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select u.first_name, u.last_name, sum(case when ttau.taskboard_task_id = tt.id and "
			+ "u.user_id = ttau.user_id then 1 else 0 end), u.color from users as u, taskboard as t left join "
			+ "taskboard_columns as tb on tb.taskboard_id = t.id and tb.active_flag =:activeFlag and "
			+ "tb.tenant_id =:tenantId left join taskboard_task as tt on tt.taskboard_id = t.id and "
			+ "tt.status = tb.column_name and tt.active_flag =:activeFlag and tt.created_on "
			+ "between :startDate and :endDate left join "
			+ "taskboard_task_assigned_users as ttau on ttau.taskboard_task_id = tt.id and "
			+ "tb.active_flag =:activeFlag and tb.tenant_id =:tenantId where ((exists "
			+ "( select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and "
			+ "(x.owner_id =:userId))) else false end)) or exists (select * from taskboard_security ts "
			+ "where ts.taskboard_id = t.id and ts.active_flag =:activeFlag and (ts.user_id =:userId) and "
			+ "exists (select * from taskboard_columns t where t.taskboard_id = t.id and "
			+ "t.active_flag =:activeFlag))) and t.id in :taskboardIdList and t.active_flag =:activeFlag and "
			+ "t.tenant_id =:tenantId group by u.first_name, u.last_name, u.color order by u.first_name, "
			+ "u.last_name", nativeQuery = true)
	public List<Object[]> getTaskByAssigneeByWorkspaceIdWithTaskboardIdListWithDateFilter(@Param("userId") UUID userId,
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate);

	@Query(value = "select u.first_name, u.last_name, sum(case when ttau.taskboard_task_id = tt.id and "
			+ "u.user_id = ttau.user_id then 1 else 0 end), u.color from users as u, taskboard as t left join "
			+ "taskboard_columns as tb on tb.taskboard_id = t.id and tb.active_flag =:activeFlag and "
			+ "tb.tenant_id =:yoroflow left join taskboard_task as tt on tt.taskboard_id = t.id and "
			+ "tt.status = tb.column_name and tt.active_flag =:activeFlag left join "
			+ "taskboard_task_assigned_users as ttau on ttau.taskboard_task_id = tt.id and "
			+ "ttau.active_flag =:activeFlag and ttau.tenant_id =:tenantId where t.workspace_id "
			+ "in :workspaceIdList and t.id in :taskboardIdList and t.active_flag =:activeFlag and "
			+ "t.tenant_id =:tenantId group by u.first_name, u.last_name, u.color order by u.first_name, "
			+ "u.last_name", nativeQuery = true)
	public List<Object[]> getTaskByAssigneeByWorkspaceIdListandTaskboardIdList(
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("workspaceIdList") List<UUID> workspaceIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select u.first_name, u.last_name, sum(case when ttau.taskboard_task_id = tt.id and "
			+ "u.user_id = ttau.user_id then 1 else 0 end), u.color from users as u, taskboard as t left join "
			+ "taskboard_columns as tb on tb.taskboard_id = t.id and tb.active_flag =:activeFlag and "
			+ "tb.tenant_id =:yoroflow left join taskboard_task as tt on tt.taskboard_id = t.id and "
			+ "tt.status = tb.column_name and tt.active_flag =:activeFlag and tt.created_on "
			+ "between :startDate and :endDate left join "
			+ "taskboard_task_assigned_users as ttau on ttau.taskboard_task_id = tt.id and "
			+ "ttau.active_flag =:activeFlag and ttau.tenant_id =:tenantId where t.workspace_id "
			+ "in :workspaceIdList and t.id in :taskboardIdList and t.active_flag =:activeFlag and "
			+ "t.tenant_id =:tenantId group by u.first_name, u.last_name, u.color order by u.first_name, "
			+ "u.last_name", nativeQuery = true)
	public List<Object[]> getTaskByAssigneeByWorkspaceIdListandTaskboardIdListWithDateFilter(
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("workspaceIdList") List<UUID> workspaceIdList,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select t.name, cast(t.id as varchar), sum(case when tc.taskboard_id = t.id and "
			+ "tt.status in (select tbc.column_name from taskboard_columns tbc where tbc.column_order <> "
			+ "(select max(column_order) from taskboard_columns tbc1 where tbc1.taskboard_id = t.id) and "
			+ "tbc.taskboard_id = t.id) then 1 else 0 end) as incompleted_task, sum(case when "
			+ "tc.taskboard_id = t.id and tt.status in (select tbc.column_name from taskboard_columns tbc "
			+ "where tbc.column_order = (select max(column_order) from taskboard_columns tbc1 where "
			+ "tbc1.taskboard_id = t.id) and tbc.taskboard_id = t.id) then 1 else 0 end) as completed_task, "
			+ "sum(case when tc.taskboard_id = t.id and tt.status = tc.column_name then 1 else 0 end) as "
			+ "total_task, cast(t.workspace_id as varchar), t.taskboard_key from taskboard t left join "
			+ "taskboard_columns as tc on tc.active_flag =:activeFlag "
			+ "and tc.tenant_id =:tenantId and t.id = tc.taskboard_id left join taskboard_task as tt on "
			+ "tt.active_flag =:activeFlag and tt.tenant_id =:tenantId and t.id = tt.taskboard_id where "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and "
			+ "(x.owner_id =:userId))) else false end)) or (exists ( select ts from taskboard_security ts "
			+ "where ts.active_flag =:activeFlag and ts.tenant_id =:tenantId and ts.taskboard_id = t.id and "
			+ "(ts.user_id =:userId)))) and t.active_flag =:activeFlag and t.tenant_id =:tenantId and "
			+ "tc.column_name = tt.status group by t.name, t.id", nativeQuery = true)
	public List<Object[]> getPortfolioForAllWorkspaceWithPagination(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select t.name, cast(t.id as varchar), sum(case when tc.taskboard_id = t.id and "
			+ "tt.status in (select tbc.column_name from taskboard_columns tbc where tbc.column_order <> "
			+ "(select max(column_order) from taskboard_columns tbc1 where tbc1.taskboard_id = t.id) and "
			+ "tbc.taskboard_id = t.id) then 1 else 0 end) as incompleted_task, sum(case when "
			+ "tc.taskboard_id = t.id and tt.status in (select tbc.column_name from taskboard_columns tbc "
			+ "where tbc.column_order = (select max(column_order) from taskboard_columns tbc1 where "
			+ "tbc1.taskboard_id = t.id) and tbc.taskboard_id = t.id) then 1 else 0 end) as completed_task, "
			+ "sum(case when tc.taskboard_id = t.id and tt.status = tc.column_name then 1 else 0 end) as "
			+ "total_task, cast(t.workspace_id as varchar), t.taskboard_key from taskboard t left join "
			+ "taskboard_columns as tc on tc.active_flag =:activeFlag "
			+ "and tc.tenant_id =:tenantId and t.id = tc.taskboard_id left join taskboard_task as tt on "
			+ "tt.active_flag =:activeFlag and tt.tenant_id =:tenantId and tt.created_on "
			+ "between :startDate and :endDate and t.id = tt.taskboard_id where "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and "
			+ "(x.owner_id =:userId))) else false end)) or (exists ( select ts from taskboard_security ts "
			+ "where ts.active_flag =:activeFlag and ts.tenant_id =:tenantId and ts.taskboard_id = t.id and "
			+ "(ts.user_id =:userId)))) and t.active_flag =:activeFlag and t.tenant_id =:tenantId and "
			+ "tc.column_name = tt.status group by t.name, t.id", nativeQuery = true)
	public List<Object[]> getPortfolioForAllWorkspaceWithPaginationAndDateFilter(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, Pageable pageable,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select t.name, cast(t.id as varchar), sum(case when tc.taskboard_id = t.id and "
			+ "tt.status in (select tbc.column_name from taskboard_columns tbc where tbc.column_order <> "
			+ "(select max(column_order) from taskboard_columns tbc1 where tbc1.taskboard_id = t.id) and "
			+ "tbc.taskboard_id = t.id) then 1 else 0 end) as incompleted_task, sum(case when "
			+ "tc.taskboard_id = t.id and tt.status in (select tbc.column_name from taskboard_columns tbc "
			+ "where tbc.column_order = (select max(column_order) from taskboard_columns tbc1 where "
			+ "tbc1.taskboard_id = t.id) and tbc.taskboard_id = t.id) then 1 else 0 end) as completed_task, "
			+ "sum(case when tc.taskboard_id = t.id and tt.status = tc.column_name then 1 else 0 end) as "
			+ "total_task, cast(t.workspace_id as varchar), t.taskboard_key from taskboard t left join taskboard_columns as tc on tc.active_flag =:activeFlag "
			+ "and tc.tenant_id =:tenantId and t.id = tc.taskboard_id left join taskboard_task as tt on "
			+ "tt.active_flag =:activeFlag and tt.tenant_id =:tenantId and t.id = tt.taskboard_id where "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and "
			+ "(x.owner_id =:userId))) else false end)) or (exists ( select ts from taskboard_security ts "
			+ "where ts.active_flag =:activeFlag and ts.tenant_id =:tenantId and ts.taskboard_id = t.id and "
			+ "(ts.user_id =:userId)))) and t.active_flag =:activeFlag and t.tenant_id =:tenantId and "
			+ "tc.column_name = tt.status group by t.name, t.id", nativeQuery = true)
	public List<Object[]> getPortfolioForAllWorkspaceWithoutPagination(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select t.name, cast(t.id as varchar), sum(case when tc.taskboard_id = t.id and "
			+ "tt.status in (select tbc.column_name from taskboard_columns tbc where tbc.column_order <> "
			+ "(select max(column_order) from taskboard_columns tbc1 where tbc1.taskboard_id = t.id) and "
			+ "tbc.taskboard_id = t.id) then 1 else 0 end) as incompleted_task, sum(case when "
			+ "tc.taskboard_id = t.id and tt.status in (select tbc.column_name from taskboard_columns tbc "
			+ "where tbc.column_order = (select max(column_order) from taskboard_columns tbc1 where "
			+ "tbc1.taskboard_id = t.id) and tbc.taskboard_id = t.id) then 1 else 0 end) as completed_task, "
			+ "sum(case when tc.taskboard_id = t.id and tt.status = tc.column_name then 1 else 0 end) as "
			+ "total_task, cast(t.workspace_id as varchar), t.taskboard_key from taskboard t left join taskboard_columns as tc on tc.active_flag =:activeFlag "
			+ "and tc.tenant_id =:tenantId and t.id = tc.taskboard_id left join taskboard_task as tt on "
			+ "tt.active_flag =:activeFlag and tt.tenant_id =:tenantId and tt.created_on "
			+ "between :startDate and :endDate and t.id = tt.taskboard_id where "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and "
			+ "(x.owner_id =:userId))) else false end)) or (exists ( select ts from taskboard_security ts "
			+ "where ts.active_flag =:activeFlag and ts.tenant_id =:tenantId and ts.taskboard_id = t.id and "
			+ "(ts.user_id =:userId)))) and t.active_flag =:activeFlag and t.tenant_id =:tenantId and "
			+ "tc.column_name = tt.status group by t.name, t.id", nativeQuery = true)
	public List<Object[]> getPortfolioForAllWorkspaceWithoutPaginationAndDateFilter(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select t.name, cast(t.id as varchar), sum(case when tc.taskboard_id = t.id and "
			+ "tt.status in (select tbc.column_name from taskboard_columns tbc where tbc.column_order <> "
			+ "(select max(column_order) from taskboard_columns tbc1 where tbc1.taskboard_id = t.id) and "
			+ "tbc.taskboard_id = t.id) then 1 else 0 end) as incompleted_task, sum(case when "
			+ "tc.taskboard_id = t.id and tt.status in (select tbc.column_name from taskboard_columns tbc "
			+ "where tbc.column_order = (select max(column_order) from taskboard_columns tbc1 where "
			+ "tbc1.taskboard_id = t.id) and tbc.taskboard_id = t.id) then 1 else 0 end) as completed_task, "
			+ "sum(case when tc.taskboard_id = t.id and tt.status = tc.column_name then 1 else 0 end) as "
			+ "total_task, cast(t.workspace_id as varchar), t.taskboard_key from taskboard t left join taskboard_columns as tc on tc.active_flag =:activeFlag "
			+ "and tc.tenant_id =:tenantId and t.id = tc.taskboard_id left join taskboard_task as tt on "
			+ "tt.active_flag =:activeFlag and tt.tenant_id =:tenantId and t.id = tt.taskboard_id where "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and "
			+ "(x.owner_id =:userId))) else false end)) or (exists ( select ts from taskboard_security ts "
			+ "where ts.active_flag =:activeFlag and ts.tenant_id =:tenantId and ts.taskboard_id = t.id and "
			+ "(ts.user_id =:userId)))) and t.active_flag =:activeFlag and t.tenant_id =:tenantId and "
			+ "t.id in :taskboardIdList and tc.column_name = tt.status group by t.name, t.id", nativeQuery = true)
	public List<Object[]> getPortfolioByTaskboardIdListWithPagination(@Param("userId") UUID userId,
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select t.name, cast(t.id as varchar), sum(case when tc.taskboard_id = t.id and "
			+ "tt.status in (select tbc.column_name from taskboard_columns tbc where tbc.column_order <> "
			+ "(select max(column_order) from taskboard_columns tbc1 where tbc1.taskboard_id = t.id) and "
			+ "tbc.taskboard_id = t.id) then 1 else 0 end) as incompleted_task, sum(case when "
			+ "tc.taskboard_id = t.id and tt.status in (select tbc.column_name from taskboard_columns tbc "
			+ "where tbc.column_order = (select max(column_order) from taskboard_columns tbc1 where "
			+ "tbc1.taskboard_id = t.id) and tbc.taskboard_id = t.id) then 1 else 0 end) as completed_task, "
			+ "sum(case when tc.taskboard_id = t.id and tt.status = tc.column_name then 1 else 0 end) as "
			+ "total_task, cast(t.workspace_id as varchar), t.taskboard_key from taskboard t left join taskboard_columns as tc on tc.active_flag =:activeFlag "
			+ "and tc.tenant_id =:tenantId and t.id = tc.taskboard_id left join taskboard_task as tt on "
			+ "tt.active_flag =:activeFlag and tt.tenant_id =:tenantId and tt.created_on "
			+ "between :startDate and :endDate and t.id = tt.taskboard_id where "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and "
			+ "(x.owner_id =:userId))) else false end)) or (exists ( select ts from taskboard_security ts "
			+ "where ts.active_flag =:activeFlag and ts.tenant_id =:tenantId and ts.taskboard_id = t.id and "
			+ "(ts.user_id =:userId)))) and t.active_flag =:activeFlag and t.tenant_id =:tenantId and "
			+ "t.id in :taskboardIdList and tc.column_name = tt.status group by t.name, t.id", nativeQuery = true)
	public List<Object[]> getPortfolioByTaskboardIdListWithPaginationAndDateFilter(@Param("userId") UUID userId,
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, Pageable pageable, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate);

	@Query(value = "select t.name, cast(t.id as varchar), sum(case when tc.taskboard_id = t.id and "
			+ "tt.status in (select tbc.column_name from taskboard_columns tbc where tbc.column_order <> "
			+ "(select max(column_order) from taskboard_columns tbc1 where tbc1.taskboard_id = t.id) and "
			+ "tbc.taskboard_id = t.id) then 1 else 0 end) as incompleted_task, sum(case when "
			+ "tc.taskboard_id = t.id and tt.status in (select tbc.column_name from taskboard_columns tbc "
			+ "where tbc.column_order = (select max(column_order) from taskboard_columns tbc1 where "
			+ "tbc1.taskboard_id = t.id) and tbc.taskboard_id = t.id) then 1 else 0 end) as completed_task, "
			+ "sum(case when tc.taskboard_id = t.id and tt.status = tc.column_name then 1 else 0 end) as "
			+ "total_task, cast(t.workspace_id as varchar), t.taskboard_key from taskboard t left join taskboard_columns as tc on tc.active_flag =:activeFlag "
			+ "and tc.tenant_id =:tenantId and t.id = tc.taskboard_id left join taskboard_task as tt on "
			+ "tt.active_flag =:activeFlag and tt.tenant_id =:tenantId and t.id = tt.taskboard_id where "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and "
			+ "(x.owner_id =:userId))) else false end)) or (exists ( select ts from taskboard_security ts "
			+ "where ts.active_flag =:activeFlag and ts.tenant_id =:tenantId and ts.taskboard_id = t.id and "
			+ "(ts.user_id =:userId)))) and t.active_flag =:activeFlag and t.tenant_id =:tenantId and "
			+ "t.id in :taskboardIdList and tc.column_name = tt.status group by t.name, t.id", nativeQuery = true)
	public List<Object[]> getPortfolioByTaskboardIdListWithoutPagination(@Param("userId") UUID userId,
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select t.name, cast(t.id as varchar), sum(case when tc.taskboard_id = t.id and "
			+ "tt.status in (select tbc.column_name from taskboard_columns tbc where tbc.column_order <> "
			+ "(select max(column_order) from taskboard_columns tbc1 where tbc1.taskboard_id = t.id) and "
			+ "tbc.taskboard_id = t.id) then 1 else 0 end) as incompleted_task, sum(case when "
			+ "tc.taskboard_id = t.id and tt.status in (select tbc.column_name from taskboard_columns tbc "
			+ "where tbc.column_order = (select max(column_order) from taskboard_columns tbc1 where "
			+ "tbc1.taskboard_id = t.id) and tbc.taskboard_id = t.id) then 1 else 0 end) as completed_task, "
			+ "sum(case when tc.taskboard_id = t.id and tt.status = tc.column_name then 1 else 0 end) as "
			+ "total_task, cast(t.workspace_id as varchar), t.taskboard_key from taskboard t left join taskboard_columns as tc on tc.active_flag =:activeFlag "
			+ "and tc.tenant_id =:tenantId and t.id = tc.taskboard_id left join taskboard_task as tt on "
			+ "tt.active_flag =:activeFlag and tt.tenant_id =:tenantId and tt.created_on "
			+ "between :startDate and :endDate and t.id = tt.taskboard_id where "
			+ "((exists ( select * from yoro_workspace w where w.workspace_id = t.workspace_id and "
			+ "w.active_flag =:activeFlag) or (case when exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id) then (exists ( select * from yoro_workspace_security x "
			+ "where x.workspace_id = t.workspace_id and x.active_flag =:activeFlag and "
			+ "(x.owner_id =:userId))) else false end)) or (exists ( select ts from taskboard_security ts "
			+ "where ts.active_flag =:activeFlag and ts.tenant_id =:tenantId and ts.taskboard_id = t.id and "
			+ "(ts.user_id =:userId)))) and t.active_flag =:activeFlag and t.tenant_id =:tenantId and "
			+ "t.id in :taskboardIdList and tc.column_name = tt.status group by t.name, t.id", nativeQuery = true)
	public List<Object[]> getPortfolioByTaskboardIdListWithoutPaginationAndDateFilter(@Param("userId") UUID userId,
			@Param("taskboardIdList") List<UUID> taskboardIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate);

	@Query(value = "select cast(t.id as varchar),t.name, cast(t.workspace_id as varchar) from taskboard t "
			+ "where ((exists ( select * from yoro_workspace w "
			+ "where w.workspace_id = t.workspace_id and w.active_flag =:activeFlag) or "
			+ "(case when exists ( select * from yoro_workspace_security x where x.workspace_id = t.workspace_id)"
			+ " then (exists ( select * from yoro_workspace_security x where x.workspace_id = t.workspace_id and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)) or exists ( select * from "
			+ "taskboard_security ts where ts.taskboard_id = t.id and ts.active_flag =:activeFlag and "
			+ "(ts.user_id =:userId) and exists ( select * from taskboard_columns t where t.taskboard_id = t.id and "
			+ "t.active_flag =:activeFlag))) and t.active_flag =:activeFlag and t.tenant_id =:tenantId "
			+ "group by t.name,t.id order by lower(t.name) asc", nativeQuery = true)
	public List<Object[]> getTaskboardNameListForWidget(@Param("userId") UUID userId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select cast(t.id as varchar), t.name, yw.workspace_name from taskboard as t left join "
			+ "yoro_workspace as yw on yw.workspace_id = t.workspace_id where t.active_flag =:activeFlag and "
			+ "t.tenant_id =:tenantId group by t.name, t.id, yw.workspace_name order by lower(t.name) asc", nativeQuery = true)
	public List<Object[]> getTaskboardNameListForAllWorkplace(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select t.name, " + "(select count(*) from TaskboardTask ts where ts.taskboard.name = t.name"
			+ " and ts.taskboard.workspaceId =:workspaceId and "
			+ "	(ts.status in (select tc.columnName from TaskboardColumns tc where tc.columnOrder <> "
			+ "	(select max(tcs.columnOrder) from TaskboardColumns tcs where t.name = tcs.taskboard.name) and "
			+ "	t.name = tc.taskboard.name))), "
			+ "(select count(*) from TaskboardTask ts where ts.taskboard.name = t.name "
			+ " and ts.taskboard.workspaceId =:workspaceId and "
			+ "	(ts.status in (select tc.columnName from TaskboardColumns tc where tc.columnOrder = "
			+ "	(select max(tcs.columnOrder) from TaskboardColumns tcs where t.name = tcs.taskboard.name) and "
			+ "	t.name = tc.taskboard.name))), t.id" + " from Taskboard t where t.workspaceId =:workspaceId "
			+ " and t.tenantId = :tenantId and t.activeFlag = :activeFlag " + "GROUP BY t.name, t.id")
	public List<Object[]> getAllInprocessAndCompletedTaskCountByWorkspace(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("workspaceId") UUID workspaceId, Pageable pageable);

	@Query(value = "select * from taskboard p where p.active_flag = :activeFlag and p.tenant_id =:tenantId and "
			+ "((case when exists (select * from taskboard_launch_permission x where x.taskboard_id = p.id and x.active_flag=:activeFlag) "
			+ "	then (exists (select * from taskboard_launch_permission x where (x.taskboard_id = p.id and "
			+ "	((x.allow_all = :activeFlag) or " + "	(x.allow_workspace = :activeFlag and "
			+ "	(exists (select * from yoro_workspace u where u.workspace_id = p.workspace_id and p.workspace_id in :workspaceId and u.active_flag=:activeFlag and "
			+ "	(u.secured_workspace_flag = 'N' or exists (select ws from yoro_workspace_security ws "
			+ "	where ws.workspace_id = u.workspace_id and (ws.owner_id =:userId or ws.group_id in :groupIdList)))))) "
			+ "	or " + "	(x.allow_taskboard_user = :activeFlag and"
			+ "	exists (select ts from taskboard_security ts where ts.active_flag = :activeFlag "
			+ "	 and ts.taskboard_id = p.id and ts.user_id=:userId)) or "
			+ "	(x.allow_taskboard_user = :activeFlag and "
			+ "	exists (select ts from taskboard_security ts where ts.active_flag = :activeFlag"
			+ "	and ts.taskboard_id = p.id and ts.group_id in :groupIdList)) or" + " x.group_id in :groupIdList or"
			+ "	x.user_id = :userId))))" + "	else false end) or "
			+ "(exists ( select * from taskboard_security ts where ts.taskboard_id = p.id "
			+ "and ts.active_flag =:activeFlag and (ts.user_id =:userId or ts.group_id in :groupIdList))"
			+ " and p.workspace_id in :workspaceId))", nativeQuery = true)
	public List<Taskboard> getTaskboardListByLaunch(@Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("workspaceId") List<UUID> workspaceId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query(value = "select * from taskboard t where t.active_flag =:activeFlag and "
			+ "t.tenant_id =:tenantId", nativeQuery = true)
	public List<Taskboard> getTaskboardFromAllWorkplaceToInactivate(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select * from taskboard t where t.id not in :taskboardsIdList and t.active_flag =:activeFlag and "
			+ "t.tenant_id =:tenantId", nativeQuery = true)
	public List<Taskboard> getTaskboardFromAllWorkplaceByIdToInactivate(
			@Param("taskboardsIdList") List<UUID> taskboardsIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

}
