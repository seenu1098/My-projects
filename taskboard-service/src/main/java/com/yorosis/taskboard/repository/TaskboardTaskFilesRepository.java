package com.yorosis.taskboard.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.taskboard.taskboard.entities.TaskboardTaskFiles;

public interface TaskboardTaskFilesRepository extends JpaRepository<TaskboardTaskFiles, UUID> {

	public TaskboardTaskFiles findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(UUID id, String tenantId,
			String activeFlag);

	@Query(value = "select * from taskboard_task_files p where p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ " exists (select * from taskboard_task ta where ta.id = p.taskboard_task_id and ta.active_flag =:activeFlag and "
			+ " exists (select * from taskboard t where t.id = ta.taskboard_id and t.active_flag =:activeFlag) and "
			+ " (case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = ta.id) then (exists (select * from taskboard_security ts where ts.taskboard_id = ta.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) or exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = ta.id and (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ "  else exists (select * from taskboard_security ts where ts.taskboard_id = ta.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end))", nativeQuery = true)
	public List<TaskboardTaskFiles> getTaskboardAttachmentsBasedOnPagination(@Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, Pageable pageable);

	@Query(value = "select * from taskboard_task_files p where p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ " exists (select * from taskboard_task ta where ta.id = p.taskboard_task_id and ta.active_flag =:activeFlag and "
			+ " exists (select * from taskboard t where t.id = ta.taskboard_id and t.active_flag =:activeFlag) and "
			+ " (case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = ta.id) then (exists (select * from taskboard_security ts where ts.taskboard_id = ta.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) or exists (select * from taskboard_task_assigned_users x where (x.taskboard_task_id = ta.id and (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag and x.tenant_id=:tenantId)))"
			+ "  else exists (select * from taskboard_security ts where ts.taskboard_id = ta.taskboard_id and ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end))", nativeQuery = true)
	public List<TaskboardTaskFiles> getTaskboardAttachments(@Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select count(p) from taskboard_task_files p where p.tenant_id =:tenantId and p.active_flag = :activeFlag and "
			+ " exists (select * from taskboard_task ta where ta.id = p.taskboard_task_id and ta.active_flag =:activeFlag and "
			+ " exists (select * from taskboard t where t.id = ta.taskboard_id and t.active_flag =:activeFlag) and "
			+ " (case when exists (select * from taskboard_task_assigned_users x where x.taskboard_task_id = ta.id) then"
			+ " (exists (select * from taskboard_security ts where ts.taskboard_id = ta.taskboard_id and"
			+ " ts.active_flag = :activeFlag and "
			+ "(ts.user_id = :userId or ts.group_id in :groupIdList)) or exists (select * from taskboard_task_assigned_users x where"
			+ " (x.taskboard_task_id = ta.id and (x.user_id=:userId or x.group_id in :groupIdList) and x.active_flag=:activeFlag "
			+ "and x.tenant_id=:tenantId)))"
			+ " else exists (select * from taskboard_security ts where ts.taskboard_id = ta.taskboard_id and "
			+ "ts.active_flag = :activeFlag and (ts.user_id = :userId or ts.group_id in :groupIdList)) end))", nativeQuery = true)
	public int getTaskboardAttachmentsCountBasedOnPagination(@Param("userId") UUID userId,
			@Param("groupIdList") List<UUID> groupIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

}
