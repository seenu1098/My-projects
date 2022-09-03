package com.yorosis.yoroflow.repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.ProcessInstance;

public interface ProcessInstanceRepo extends JpaRepository<ProcessInstance, UUID> {

	public ProcessInstance findByProcessInstanceIdAndTenantId(UUID processInstanceId, String tenantId);

	public ProcessInstance findByProcessInstanceId(UUID processInstanceId);

	@Query("select p from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId and p.startedBy = :userName and p.tenantId = :tenantId ")
	public List<ProcessInstance> getLaunchedList(@Param("userName") String userName, @Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId, Pageable pageable);

	@Query("select p from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId and p.startedBy = :userName and p.tenantId = :tenantId ")
	public List<ProcessInstance> getLaunchedListWithoutPagination(@Param("userName") String userName,
			@Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	@Query("select count(p) from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId and p.startedBy = :userName and p.tenantId = :tenantId ")
	public Integer getLaunchedListCount(@Param("userName") String userName, @Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId);
	
	@Query("select p from ProcessInstance p where p.processDefinition.workspaceId in :workspaceId"
			+ " and p.processDefinition.startType = 'manual' and p.startedBy = :userName and p.tenantId = :tenantId "
			+ "and not exists (select 1 from ProcessInstanceTask pt where pt.processInstance.processInstanceId = p.processInstanceId and"
			+ " pt.status = 'ABORTED' and pt.processDefinitionTask.taskType ='START_TASK')")
	public List<ProcessInstance> getLaunchedListForMyRequest(@Param("userName") String userName, @Param("tenantId") String tenantId,
			@Param("workspaceId") List<UUID> workspaceId, Pageable pageable);

	@Query("select p from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId "
			+ " and p.processDefinition.startType = 'manual' and p.startedBy = :userName and p.tenantId = :tenantId "
			+ "and not exists (select 1 from ProcessInstanceTask pt where pt.processInstance.processInstanceId = p.processInstanceId and"
			+ " pt.status = 'ABORTED' and pt.processDefinitionTask.taskType ='START_TASK')")
	public List<ProcessInstance> getLaunchedListWithoutPaginationForMyRequest(@Param("userName") String userName,
			@Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	@Query("select count(p) from ProcessInstance p where p.processDefinition.workspaceId in :workspaceId "
			+ " and p.processDefinition.startType = 'manual' and p.startedBy = :userName and p.tenantId = :tenantId "
			+ "and not exists (select 1 from ProcessInstanceTask pt where pt.processInstance.processInstanceId = p.processInstanceId and"
			+ " pt.status = 'ABORTED' and pt.processDefinitionTask.taskType ='START_TASK')")
	public Integer getLaunchedListCountForMyRequest(@Param("userName") String userName, @Param("tenantId") String tenantId,
			@Param("workspaceId") List<UUID> workspaceId);

	@Query("select p from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId and (p.createdDate >=:start_date and p.createdDate <=:end_date) "
			+ "and p.tenantId=:tenantId order by p.createdDate asc")
	public Set<ProcessInstance> getTotalTaskByStartDate(@Param("start_date") LocalDateTime startDate,
			@Param("end_date") LocalDateTime endDate, @Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId and p.status=:status and p.tenantId=:tenantId")
	public List<ProcessInstance> getProcessInstanceList(Pageable pageable, @Param("status") String status,
			@Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId and p.status=:status and p.tenantId=:tenantId")
	public List<ProcessInstance> getProcessInstanceListWithoutPagination(@Param("status") String status,
			@Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	@Query("select count(p) from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId and p.status=:status and p.tenantId=:tenantId")
	public String getProcessInstanceListCount(@Param("status") String status, @Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId);

	@Query("select count(p) from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId and p.status= 'COMPLETED' and p.tenantId=:tenantId")
	public Long getProcessInstanceListCountCompleted(@Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId);

	@Query("select count(p) from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId and p.status= 'IN_PROCESS' and p.tenantId=:tenantId")
	public Long getProcessInstanceListCountInProcess(@Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId);

	@Query("select count(p) from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId and p.status= 'ERROR' and p.tenantId=:tenantId")
	public Long getProcessInstanceListCountError(@Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId and p.status=:status and p.endTime between :startDate and :endDate and p.tenantId=:tenantId")
	public List<ProcessInstance> getProcessInstanceCompletedListBasedOnSearch(
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable,
			@Param("status") String status, @Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	@Query("select count(p) from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId and p.status=:status and p.endTime between :startDate and :endDate and p.tenantId=:tenantId")
	public String getProcessInstanceCompletedListBasedOnSearchCount(@Param("startDate") LocalDateTime startDate,
			@Param("endDate") LocalDateTime endDate, @Param("status") String status, @Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId and p.status=:status and p.endTime between :startDate and :endDate and p.tenantId=:tenantId order by p.endTime desc")
	public List<ProcessInstance> getProcessInstanceCompletedListBasedOnSearchWithoutPagination(
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate,
			@Param("status") String status, @Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstance p where p.processDefinition.processDefinitionId =:procDefId and p.status = 'IN_PROCESS' and p.tenantId=:tenantId "
			+ "and exists (select pt from ProcessInstanceTask pt where pt.processInstance.processInstanceId = p.processInstanceId and pt.status = 'IN_PROCESS' and pt.data is not null and pt.processDefinitionTask.taskType = 'START_TASK')"
			+ " order by p.createdDate desc")
	public List<ProcessInstance> getProcessInstanceListForDraftLaunch(@Param("procDefId") UUID procDefId,
			@Param("tenantId") String tenantId);

	@Query("select t.processDefinition.processDefinitionName, count(CASE WHEN t.status = 'IN_PROCESS' THEN 1 ELSE NULL END), count(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE NULL END)"
			+ " from ProcessInstance t where t.status <> 'ERROR' and t.processDefinition.workspaceId =:workspaceId "
			+ " and t.processDefinition.tenantId = :tenantId and t.processDefinition.activeFlag = :activeFlag"
			+ " and t.tenantId = :tenantId " + "GROUP BY t.processDefinition.processDefinitionName")
	public List<Object[]> getAllInprocessAndCompletedTaskCountByWorkspace(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("workspaceId") UUID workspaceId);

	@Query("select count(p) from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId and p.status= 'COMPLETED' "
			+ "and p.tenantId=:tenantId and p.createdBy = :userName")
	public Long getProcessInstanceListCountCompletedByUser(@Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId, @Param("userName") String userName);

	@Query("select count(p) from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId and p.status= 'IN_PROCESS' "
			+ "and p.tenantId=:tenantId and p.createdBy = :userName ")
	public Long getProcessInstanceListCountInProcessByUser(@Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId, @Param("userName") String userName);

	@Query("select p from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId and p.status=:status and"
			+ " p.tenantId=:tenantId and p.createdBy = :userName")
	public List<ProcessInstance> getProcessInstanceListByUser(Pageable pageable, @Param("status") String status,
			@Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId,
			@Param("userName") String userName);

	@Query("select p from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId and p.status=:status and"
			+ " p.tenantId=:tenantId and p.createdBy = :userName")
	public List<ProcessInstance> getProcessInstanceListWithoutPaginationByUser(@Param("status") String status,
			@Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId,
			@Param("userName") String userName);

	@Query("select count(p) from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId and p.status=:status and "
			+ "p.tenantId=:tenantId and p.createdBy = :userName")
	public String getProcessInstanceListCountByUser(@Param("status") String status, @Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId, @Param("userName") String userName);

	@Query(value = "select * from process_instance as p left join process_definitions as pd on "
			+ "pd.process_definition_id = p.process_definition_id where p.status =:status and "
			+ "p.tenant_id =:tenantId and (case when exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = pd.workspace_id) then (exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = pd.workspace_id and x.active_flag =:activeFlag and (x.owner_id =:userId))) "
			+ "else true end)", nativeQuery = true)
	public List<ProcessInstance> getProcessInstanceForAllWorkplacePageble(@Param("status") String status,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, @Param("userId") UUID userId,
			Pageable pageable);

	@Query(value = "select * from process_instance as p left join process_definitions as pd on "
			+ "pd.process_definition_id = p.process_definition_id where p.status =:status and "
			+ "p.tenant_id =:tenantId and p.created_date between :startDate and :endDate and "
			+ "(case when exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = pd.workspace_id) then (exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = pd.workspace_id and x.active_flag =:activeFlag and (x.owner_id =:userId))) "
			+ "else true end)", nativeQuery = true)
	public List<ProcessInstance> getProcessInstanceForAllWorkplacePagebleWithDateFilter(@Param("status") String status,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, @Param("userId") UUID userId,
			Pageable pageable, @Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select * from process_instance as p left join process_definitions as pd on "
			+ "pd.process_definition_id = p.process_definition_id where p.status =:status and "
			+ "p.tenant_id =:tenantId and (case when exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = pd.workspace_id) then (exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = pd.workspace_id and x.active_flag =:activeFlag and (x.owner_id =:userId))) "
			+ "else true end)", nativeQuery = true)
	public List<ProcessInstance> getProcessInstanceForAllWorkplace(@Param("status") String status,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, @Param("userId") UUID userId);

	@Query(value = "select * from process_instance as p left join process_definitions as pd on "
			+ "pd.process_definition_id = p.process_definition_id where p.status =:status and "
			+ "p.created_date between :startDate and :endDate and "
			+ "p.tenant_id =:tenantId and (case when exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = pd.workspace_id) then (exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = pd.workspace_id and x.active_flag =:activeFlag and (x.owner_id =:userId))) "
			+ "else true end)", nativeQuery = true)
	public List<ProcessInstance> getProcessInstanceForAllWorkplaceWithDateFilter(@Param("status") String status,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, @Param("userId") UUID userId,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select count(*) from process_instance as p left join process_definitions as pd on "
			+ "pd.process_definition_id = p.process_definition_id where p.status =:status and "
			+ "p.tenant_id =:tenantId and (case when exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = pd.workspace_id) then (exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = pd.workspace_id and x.active_flag =:activeFlag and (x.owner_id =:userId))) "
			+ "else true end)", nativeQuery = true)
	public int getCountForProcessInstanceForAllWorkplace(@Param("status") String status,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, @Param("userId") UUID userId);

	@Query(value = "select count(*) from process_instance as p left join process_definitions as pd on "
			+ "pd.process_definition_id = p.process_definition_id where p.status =:status and "
			+ "p.tenant_id =:tenantId and p.created_date between :startDate and :endDate and "
			+ "(case when exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = pd.workspace_id) then (exists (select * from yoro_workspace_security x "
			+ "where x.workspace_id = pd.workspace_id and x.active_flag =:activeFlag and (x.owner_id =:userId))) "
			+ "else true end)", nativeQuery = true)
	public int getCountForProcessInstanceForAllWorkplaceWithDateFilter(@Param("status") String status,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag, @Param("userId") UUID userId,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

}
