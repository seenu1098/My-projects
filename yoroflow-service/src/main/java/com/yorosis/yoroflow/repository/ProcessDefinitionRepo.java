package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.ProcessDefinition;

public interface ProcessDefinitionRepo extends JpaRepository<ProcessDefinition, UUID> {

	@Query("select p from ProcessDefinition p where lower(p.key) = lower(:processDefinitionKey) and p.tenantId = :tenantId and p.activeFlag=:activeFlag")
	public List<ProcessDefinition> getProcessDefinitionByKey(@Param("processDefinitionKey") String processDefinitionKey,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select p from ProcessDefinition p where p.workspaceId =:workspaceId and lower(p.key) = lower(:processDefinitionKey) and p.tenantId = :tenantId and p.activeFlag=:activeFlag "
			+ "order by p.workflowVersion desc")
	public List<ProcessDefinition> getProcessDefinitionByKeyWithWorkspace(
			@Param("processDefinitionKey") String processDefinitionKey, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessDefinition p where lower(p.key) = lower(:processDefinitionKey) and p.status = 'published' and p.tenantId = :tenantId and p.activeFlag=:activeFlag")
	public ProcessDefinition getLatestProcessDefinitionByKey(@Param("processDefinitionKey") String processDefinitionKey,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select p from ProcessDefinition p where p.workspaceId =:workspaceId and p.status in ('draft', 'published') and p.tenantId = :tenantId and p.activeFlag = :activeFlag")
	public List<ProcessDefinition> findAll(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessDefinition p where p.workspaceId =:workspaceId and p.key =:key and p.workflowVersion =:workflow_version and p.tenantId = :tenantId and p.activeFlag=:activeFlag")
	public ProcessDefinition getProcessDefinitionByKeyAndVersion(@Param("workflow_version") Long workflowVersion,
			@Param("key") String key, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("workspaceId") UUID workspaceId);

	@Query("select pdp.processDefinition from ProcessDefPrmsn pdp where pdp.processDefinition.workspaceId =:workspaceId and pdp.processDefinition.status <> 'old' and pdp.processDefinition.startType = :startType and pdp.processDefinition.tenantId = :tenantId and pdp.groupId IN :groupId and pdp.activeFlag=:activeFlag and pdp.processDefinition.activeFlag=:activeFlag order by pdp.processDefinition.workflowVersion desc")
	public Set<ProcessDefinition> getHighestVersionWorkflowByKey(@Param("tenantId") String tenantId,
			@Param("groupId") List<UUID> listGroupId, @Param("activeFlag") String activeFlag,
			@Param("startType") String startType, @Param("workspaceId") UUID workspaceId);
	
	@Query("select pdp.processDefinition from ProcessDefPrmsn pdp where pdp.processDefinition.workspaceId in :workspaceId and pdp.processDefinition.status <> 'old' and pdp.processDefinition.startType = :startType and pdp.processDefinition.tenantId = :tenantId and pdp.groupId IN :groupId and pdp.activeFlag=:activeFlag and pdp.processDefinition.activeFlag=:activeFlag order by pdp.processDefinition.workflowVersion desc")
	public Set<ProcessDefinition> getHighestVersionWorkflowByKeyForLaunch(@Param("tenantId") String tenantId,
			@Param("groupId") List<UUID> listGroupId, @Param("activeFlag") String activeFlag,
			@Param("startType") String startType, @Param("workspaceId") List<UUID> workspaceId);

	@Query("select pdp.processDefinition from ProcessDefPrmsn pdp where pdp.processDefinition.status <> 'old' and pdp.processDefinition.startType = :startType and pdp.processDefinition.tenantId = :tenantId and pdp.groupId IN :groupId and pdp.activeFlag=:activeFlag and pdp.processDefinition.activeFlag=:activeFlag order by pdp.processDefinition.workflowVersion desc")
	public Set<ProcessDefinition> getHighestVersionWorkflowByKeyWithoutWorkspace(@Param("tenantId") String tenantId,
			@Param("groupId") List<UUID> listGroupId, @Param("activeFlag") String activeFlag,
			@Param("startType") String startType);

	@Query("select pdp.processDefinition from ProcessDefPrmsn pdp where pdp.processDefinition.workspaceId =:workspaceId and pdp.processDefinition.status = 'published' and pdp.processDefinition.startType = 'manual' and pdp.processDefinition.tenantId = :tenantId and pdp.groupId IN :groupId and pdp.activeFlag=:activeFlag and pdp.processDefinition.activeFlag=:activeFlag order by pdp.processDefinition.workflowVersion desc")
	public Set<ProcessDefinition> getHighestVersionWorkflowByKeyForApp(@Param("tenantId") String tenantId,
			@Param("groupId") List<UUID> listGroupId, @Param("activeFlag") String activeFlag,
			@Param("workspaceId") UUID workspaceId);

	@Query("select count(pdp.processDefinition) from ProcessDefPrmsn pdp where pdp.processDefinition.workspaceId =:workspaceId and pdp.processDefinition.status <> 'old' and pdp.processDefinition.startType = :startType and pdp.processDefinition.tenantId = :tenantId and pdp.groupId IN :groupId and pdp.activeFlag=:activeFlag and pdp.processDefinition.activeFlag=:activeFlag")
	public int getWorkflowApplicationsListCount(@Param("tenantId") String tenantId,
			@Param("groupId") List<UUID> listGroupId, @Param("activeFlag") String activeFlag,
			@Param("startType") String startType, @Param("workspaceId") UUID workspaceId);

	@Query("select pdp.processDefinition from ProcessDefPrmsn pdp where pdp.processDefinition.workspaceId =:workspaceId and pdp.processDefinition.status <> 'old' and pdp.processDefinition.tenantId = :tenantId and pdp.groupId IN :groupId and pdp.activeFlag=:activeFlag and pdp.processDefinition.activeFlag=:activeFlag order by pdp.processDefinition.workflowVersion desc")
	public Set<ProcessDefinition> getHighestVersionWorkflowByKeyWithoutPropertyType(@Param("tenantId") String tenantId,
			@Param("groupId") List<UUID> listGroupId, @Param("activeFlag") String activeFlag,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p.processDefinitionTask.processDefinition from ProcessDefTaskPrmsn p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and p.processDefinitionTask.processDefinition.status = 'published' "
			+ " and p.processDefinitionTask.processDefinition.activeFlag=:activeFlag and p.processDefinitionTask.processDefinition.tenantId =:tenantId and (p.userId= :userId or p.groupId IN :groupId) order by p.processDefinitionTask.processDefinition.workflowVersion desc")
	public Set<ProcessDefinition> getWorkflowList(@Param("userId") UUID userId, @Param("groupId") List<UUID> groupId,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p.processDefinitionTask.processDefinition from ProcessDefTaskPrmsn p where "
			+ " p.processDefinitionTask.processDefinition.activeFlag=:activeFlag and p.processDefinitionTask.processDefinition.tenantId =:tenantId "
			+ " and p.processDefinitionTask.processDefinition.key=:key and "
			+ " (p.userId= :userId or p.groupId IN :groupId) order by p.processDefinitionTask.processDefinition.workflowVersion desc")
	public Set<ProcessDefinition> getWorkflowVersionListByKey(@Param("key") String key, @Param("userId") UUID userId,
			@Param("groupId") List<UUID> groupId, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select p from ProcessDefinition p where p.workspaceId =:workspaceId and p.status = 'draft' and p.activeFlag=:activeFlag and p.tenantId =:tenantId order by p.workflowVersion desc")
	public Set<ProcessDefinition> getWorkflowListWithDraft(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("workspaceId") UUID workspaceId);

	public List<ProcessDefinition> findBykeyAndTenantIdAndActiveFlagIgnoreCase(String key, String tenantId,
			String activeFlag);

	@Query("select p from ProcessDefinition p where p.tenantId=:tenantId and p.activeFlag=:activeFlag and p.schedulerExpression is not null")
	public Stream<ProcessDefinition> getAllScheduledTasks(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	public ProcessDefinition findByProcessDefinitionIdAndTenantIdAndActiveFlag(UUID processDefinitionId,
			String tenantId, String activeFlag);

	@Query("select p from ProcessDefinition p where p.workspaceId =:workspaceId and p.status='published' and p.tenantId = :tenantId and p.activeFlag=:activeFlag")
	public List<ProcessDefinition> findByPublishedStatus(String tenantId, String activeFlag,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessDefinition p where p.key=:key and p.tenantId=:tenantId and p.activeFlag=:activeFlag")
	public List<ProcessDefinition> getProcessDefKey(@Param("key") String key, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select count(p) from ProcessDefinition p where p.processDefinitionName=:name and p.tenantId = :tenantId and p.activeFlag=:activeFlag")
	public int getProcessDefName(@Param("name") String name, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select count(p) from ProcessDefinition p where p.key=:key and p.tenantId = :tenantId and p.activeFlag=:activeFlag")
	public int getDefKey(@Param("key") String key, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select pdp.processDefinition from ProcessDefPrmsn pdp where pdp.processDefinition.workspaceId =:workspaceId and pdp.processDefinition.status = 'published' and pdp.processDefinition.key in :workflowPinKeyList and pdp.processDefinition.tenantId = :tenantId and pdp.groupId IN :groupId and pdp.activeFlag=:activeFlag order by pdp.processDefinition.workflowVersion desc")
	public Set<ProcessDefinition> getHighestVersionWorkflowByKeyForPin(@Param("tenantId") String tenantId,
			@Param("groupId") List<UUID> listGroupId, @Param("activeFlag") String activeFlag,
			@Param("workflowPinKeyList") List<String> workflowPinKeyList, @Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessDefinition p where p.processDefinitionName = :processDefinitionName and p.status = 'published' and p.tenantId = :tenantId and p.activeFlag=:activeFlag")
	public ProcessDefinition getLatestProcessDefinitionByName(
			@Param("processDefinitionName") String processDefinitionName, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select p from ProcessDefinition p where p.key = :key and p.status = 'published' and p.tenantId = :tenantId and p.activeFlag=:activeFlag")
	public ProcessDefinition getLatestProcessDefinitionByDefinitionKey(@Param("key") String key,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select p from ProcessDefinition p where p.processDefinitionName = :processDefinitionName and p.startTaskKey=:startTaskKey and p.tenantId = :tenantId and p.activeFlag=:activeFlag and (p.status='published' or p.status='draft')")
	public List<ProcessDefinition> getProcessDefinitionByKey(
			@Param("processDefinitionName") String processDefinitionName, @Param("startTaskKey") String startTaskKey,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select p from ProcessDefinition p where p.key = :key and p.workflowVersion=:workflowVersion and p.tenantId = :tenantId and p.activeFlag=:activeFlag and p.uploadWorkflow='Y'")
	public ProcessDefinition getProcessDefinition(@Param("key") String key,
			@Param("workflowVersion") long workflowVersion, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select p from ProcessDefinition p where p.workspaceId =:workspaceId and p.tenantId = :tenantId and p.activeFlag=:activeFlag and p.uploadWorkflow='Y'")
	public List<ProcessDefinition> getUploadedProcessDefinitionList(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessDefinition p where p.processDefinitionName=:processDefinitionName and p.tenantId = :tenantId and p.activeFlag=:activeFlag and p.uploadWorkflow='Y'")
	public ProcessDefinition getProcessDefinition(@Param("processDefinitionName") String processDefinitionName,
			@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	public ProcessDefinition findByProcessDefinitionNameAndWorkflowVersion(String processDefinitionName,
			long workflowVersion);

	@Query("select p.processDefinition from ProcessInstance p where p.processDefinition.workspaceId =:workspaceId and p.startedBy=:startedBy and p.processDefinition.startType = 'manual'"
			+ " and p.tenantId=:tenantId and p.processDefinition.status = 'published' and p.processDefinition.activeFlag = 'Y' order by p.createdDate desc")
	public Set<ProcessDefinition> getLatestLaunchedInstance(@Param("startedBy") String startedBy,
			@Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	@Query("select pdp.processDefinition from ProcessDefPrmsn pdp where pdp.processDefinition.workspaceId =:workspaceId and pdp.processDefinition.status = 'published' and pdp.processDefinition.startType = 'manual' and pdp.processDefinition.tenantId = :tenantId and pdp.groupId IN :groupId and pdp.activeFlag=:activeFlag and pdp.processDefinition.activeFlag=:activeFlag order by pdp.processDefinition.createdDate desc")
	public Set<ProcessDefinition> getLatestCreatedWorkflow(@Param("tenantId") String tenantId,
			@Param("groupId") List<UUID> listGroupId, @Param("activeFlag") String activeFlag,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessDefinition p where p.key = :processDefinitionKey and p.workflowVersion = :version and p.activeFlag =:activeFlag and p.tenantId =:tenantId "
			+ " and exists (select pit from ProcessInstanceTask pit where pit.processInstance.processDefinition.processDefinitionId = p.processDefinitionId and pit.processInstance.startedBy =:userName and pit.tenantId =:tenantId and "
			+ "pit.status = 'IN_PROCESS' and pit.data is not null and pit.processDefinitionTask.taskType = 'START_TASK')")
	public ProcessDefinition checkDraftWorkflowTask(@Param("processDefinitionKey") String processDefinitionKey,
			@Param("version") Long version, @Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag,
			@Param("userName") String userName);

	@Query("select t.workspaceId, count(t) from ProcessDefinition t where t.status <> 'old' and t.activeFlag = :activeFlag and t.tenantId = :tenantId and "
			+ " exists (select ts from ProcessDefPrmsn ts where ts.activeFlag = :activeFlag"
			+ " and ts.processDefinition.id = t.id and (ts.groupId in :groupId)) GROUP BY t.workspaceId")
	public List<Object[]> getHighestVersionWorkflowNamesByKey(@Param("tenantId") String tenantId,
			@Param("groupId") List<UUID> groupId, @Param("activeFlag") String activeFlag);

	@Query("select t.workspaceId, count(t) from ProcessDefinition t where t.status <> 'old' and "
			+ "t.activeFlag = :activeFlag and t.tenantId = :tenantId and "
			+ " t.workflowVersion = (select max(pd.workflowVersion) from ProcessDefinition pd where"
			+ " pd.processDefinitionId = t.processDefinitionId) " + "GROUP BY t.workspaceId")
	public List<Object[]> getAllHighestVersionWorkflowNamesByKey(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query("select count(t) from ProcessDefinition t where t.status <> 'old' and t.activeFlag = :activeFlag and t.tenantId = :tenantId")
	public int getTotalWorkflowCount(@Param("tenantId") String tenantId, @Param("activeFlag") String activeFlag);

	@Query("select p from ProcessDefinition p where p.processDefinitionId in :id and p.tenantId = :tenantId and p.activeFlag = :activeFlag")
	public List<ProcessDefinition> getByProcessDefUUIDList(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("id") List<UUID> id);

	@Query("select p.key from ProcessDefinition p where p.workspaceId = :workspaceId and p.tenantId = :tenantId and p.activeFlag = :activeFlag")
	public List<String> getByProcessDefKeyList(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessDefinition p where p.key = :key and p.workflowVersion=:workflowVersion and p.workspaceId = :workspaceId and p.status not in ('old', 'draft') and  p.tenantId = :tenantId and p.activeFlag=:activeFlag")
	public ProcessDefinition getProcessDefinitionByKeyForReport(@Param("key") String key,
			@Param("workflowVersion") long workflowVersion, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("workspaceId") UUID workspaceId);

	@Query("select t.processDefinitionName, " + "(select count(*) from ProcessInstance tp where tp.status ='IN_PROCESS'"
			+ "	and tp.processDefinition.processDefinitionId = t.processDefinitionId"
			+ " and tp.processDefinition.workspaceId =:workspaceId) as inProcess, "
			+ "(select count(*) from ProcessInstance tp where tp.status ='COMPLETED'"
			+ "	and tp.processDefinition.processDefinitionId = t.processDefinitionId"
			+ " and tp.processDefinition.workspaceId =:workspaceId) as completed, t.processDefinitionId"
			+ " from ProcessDefinition t where t.workspaceId =:workspaceId "
			+ " and t.tenantId = :tenantId and t.status <> 'old' and "
			+ "	t.workflowVersion = (select max(pd.workflowVersion) from ProcessDefinition pd where "
			+ " pd.processDefinitionId = t.processDefinitionId) " + " and t.activeFlag =:activeFlag "
			+ "GROUP BY t.processDefinitionName, t.processDefinitionId")
	public List<Object[]> getAllInprocessAndCompletedTaskCountByWorkspace(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag, @Param("workspaceId") UUID workspaceId, Pageable pageable);

	@Query("select pdp.processDefinition from ProcessDefPrmsn pdp where pdp.processDefinition.status = 'published' and pdp.processDefinition.key in :workflowPinKeyList and pdp.processDefinition.tenantId = :tenantId and pdp.groupId IN :groupId and pdp.activeFlag=:activeFlag order by pdp.processDefinition.workflowVersion desc")
	public Set<ProcessDefinition> getHighestVersionWorkflowByKeyForPinWithoutWorkspace(
			@Param("tenantId") String tenantId, @Param("groupId") List<UUID> listGroupId,
			@Param("activeFlag") String activeFlag, @Param("workflowPinKeyList") List<String> workflowPinKeyList);

	@Query("select pdp.processDefinition from ProcessDefPrmsn pdp where pdp.processDefinition.status = 'published' and pdp.processDefinition.startType = 'manual' and pdp.processDefinition.tenantId = :tenantId and pdp.groupId IN :groupId and pdp.activeFlag=:activeFlag and pdp.processDefinition.activeFlag=:activeFlag order by pdp.processDefinition.workflowVersion desc")
	public Set<ProcessDefinition> getHighestVersionWorkflowByKeyForAppWithoutWorkspace(
			@Param("tenantId") String tenantId, @Param("groupId") List<UUID> listGroupId,
			@Param("activeFlag") String activeFlag);

	@Query("select pdp.processDefinition from ProcessDefPrmsn pdp where pdp.processDefinition.status <> 'old' and pdp.processDefinition.tenantId = :tenantId and pdp.groupId IN :groupId and pdp.activeFlag=:activeFlag and pdp.processDefinition.activeFlag=:activeFlag order by pdp.processDefinition.workflowVersion desc")
	public Set<ProcessDefinition> getHighestVersionWorkflowByKeyWithoutPropertyTypeWithoutWorkspace(
			@Param("tenantId") String tenantId, @Param("groupId") List<UUID> listGroupId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select cast(pdp.process_definition_id as varchar), pdp.process_definition_name, "
			+ "yw.workspace_name from process_definitions as pdp left join yoro_workspace as yw on "
			+ "yw.workspace_id = pdp.workspace_id where pdp.status <> 'old' and pdp.tenant_id =:tenantId and "
			+ "pdp.active_flag =:activeFlag order by pdp.workflow_version desc", nativeQuery = true)
	public Set<Object[]> getWorkflowListWithoutWorkspace(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select * from process_definitions as pdp where pdp.status <> 'old' and "
			+ "pdp.tenant_id =:tenantId and "
			+ "pdp.active_flag =:activeFlag order by pdp.workflow_version desc", nativeQuery = true)
	public List<ProcessDefinition> getWorkflowListForInactivate(@Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select * from process_definitions as pdp where pdp.process_definition_id not in :workflowsIdList "
			+ "and pdp.status <> 'old' and pdp.tenant_id =:tenantId and "
			+ "pdp.active_flag =:activeFlag order by pdp.workflow_version desc", nativeQuery = true)
	public List<ProcessDefinition> getWorkflowListForInactivateById(
			@Param("workflowsIdList") List<UUID> workflowsIdList, @Param("tenantId") String tenantId,
			@Param("activeFlag") String activeFlag);

}