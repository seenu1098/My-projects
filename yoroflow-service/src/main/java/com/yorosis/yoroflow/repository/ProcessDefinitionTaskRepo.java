package com.yorosis.yoroflow.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.ProcessDefinitionTask;

public interface ProcessDefinitionTaskRepo extends JpaRepository<ProcessDefinitionTask, UUID> {

	@Query("SELECT c FROM ProcessDefinitionTask c where c.taskStepKey = :taskKey and c.processDefinition.processDefinitionId = :processDefID and c.tenantId = :tenantId")
	public ProcessDefinitionTask getProcessTask(@Param("processDefID") UUID processDefID, @Param("taskKey") String taskKey, @Param("tenantId") String tenantId);

	@Query("SELECT c FROM ProcessDefinitionTask c where c.taskType = 'END_TASK' and c.processDefinition.processDefinitionId = :processDefID and c.tenantId = :tenantId")
	public ProcessDefinitionTask getProcessEndTask(@Param("processDefID") UUID processDefID, @Param("tenantId") String tenantId);

	public ProcessDefinitionTask findByTaskIdAndTenantId(UUID taskId, String tenantId);

	public List<ProcessDefinitionTask> findByTenantId(@Param("tenantId") String tenantId);

	@Query("SELECT c FROM ProcessDefinitionTask c where c.processDefinition.processDefinitionId = :processDefID and taskType='USER_TASK' and c.tenantId = :tenantId")
	public ProcessDefinitionTask getProcessTaskName(@Param("processDefID") UUID processDefID, @Param("tenantId") String tenantId);

	@Query("SELECT c.taskStepKey FROM ProcessDefinitionTask c where c.processDefinition.processDefinitionId = :processDefinitionId  and c.tenantId = :tenantId and c.taskType = 'END_TASK'")
	public String getEndTaskKey(@Param("processDefinitionId") UUID processDefinitionId, @Param("tenantId") String tenantId);

	@Query("SELECT c FROM ProcessDefinitionTask c where c.taskStepKey = :taskKey and c.processDefinition.processDefinitionId = :processDefinitionId and c.tenantId = :tenantId")
	public ProcessDefinitionTask getProcessTaskForSendBack(@Param("taskKey") String taskKey, @Param("processDefinitionId") UUID processDefinitionId,
			@Param("tenantId") String tenantId);

	@Query("SELECT c FROM ProcessDefinitionTask c where c.processDefinition.key =:key and c.processDefinition.workflowVersion =:workflowVersion "
			+ "and c.taskType not in ('SEQ_FLOW', 'END_TASK') and c.taskName is not null and c.tenantId = :tenantId")
	public List<ProcessDefinitionTask> getProcessTaskName(@Param("key") String key, @Param("workflowVersion") Long workflowVersion,
			@Param("tenantId") String tenantId);
	
	@Query("SELECT c FROM ProcessDefinitionTask c where c.processDefinition.workspaceId =:workspaceId and c.processDefinition.key =:key and c.processDefinition.workflowVersion =:workflowVersion "
			+ "and c.taskType not in ('SEQ_FLOW', 'END_TASK') and c.taskName is not null and c.taskName = :taskName and c.tenantId = :tenantId")
	public List<ProcessDefinitionTask> getProcessTaskNameById(@Param("key") String key, @Param("workflowVersion") Long workflowVersion,
			@Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId, @Param("taskName") String taskName);

	@Query("SELECT c FROM ProcessDefinitionTask c where c.processDefinition.workspaceId =:workspaceId and c.processDefinition.key =:key "
			+ "and c.taskType not in ('SEQ_FLOW', 'END_TASK') and c.taskName is not null and c.taskName = :taskName and c.tenantId = :tenantId")
	public List<ProcessDefinitionTask> getProcessTaskNameByKey(@Param("key") String key,
			@Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId, @Param("taskName") String taskName);
	
	@Query("SELECT count(c) FROM ProcessDefinitionTask c where c.processDefinition.processDefinitionId =:processDefinitionId "
			+ "and c.taskType in ('USER_TASK', 'START_TASK', 'APPROVE_TASK') and c.tenantId = :tenantId")
	public int getProcessTaskTotalList(@Param("processDefinitionId") UUID processDefinitionId,
			@Param("tenantId") String tenantId);
}
