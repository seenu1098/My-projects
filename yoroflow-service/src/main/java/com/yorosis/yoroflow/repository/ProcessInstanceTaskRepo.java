package com.yorosis.yoroflow.repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yorosis.yoroflow.entities.ProcessInstanceTask;

public interface ProcessInstanceTaskRepo extends JpaRepository<ProcessInstanceTask, UUID> {

	public ProcessInstanceTask findByProcessInstanceTaskId(UUID processInstanceTaskId);

	public ProcessInstanceTask findByinitiatedProcessInstanceID(UUID initiatedByProcessTaskID);

	@Query("select p from ProcessInstanceTask p where  (p.assignedTo = :userid or p.assignedToGroup in :assignedToGroup ) "
			+ "and ( p.status <>:status or p.status is null ) and ( p.processDefinitionTask.taskType = 'USER_TASK' or "
			+ "p.processDefinitionTask.taskType ='APPROVAL_TASK' or p.processDefinitionTask.taskType ='START_TASK') and "
			+ " p.tenantId = :tenantId and p.processDefinitionTask.processDefinition.workspaceId =:workspaceId order by p.startTime asc")
	public List<ProcessInstanceTask> getTaskListForUserWithStatus(@Param("status") String status,
			@Param("userid") UUID userid, @Param("tenantId") String tenantId,
			@Param("assignedToGroup") List<UUID> assignedToGroup, @Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processInstanceTaskId=:processInstanceTaskId and p.assignedTo is null and  p.tenantId = :tenantId")
	public ProcessInstanceTask getProcessInstanceTask(@Param("processInstanceTaskId") UUID processInstanceTaskId,
			@Param("tenantId") String tenantId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId in :workspaceId and "
			+ " (p.assignedTo = :userId or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and x.userId = :userId))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public List<ProcessInstanceTask> getPendingUserTasks(@Param("userId") UUID userid,
			@Param("tenantId") String tenantId, @Param("date") LocalDateTime date,
			@Param("workspaceId") List<UUID> workspaceId, Pageable pageable);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId in :workspaceId and "
			+ " (p.assignedToGroup in :groupIdsList or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and x.groupId in :groupIdsList))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public List<ProcessInstanceTask> getPendingGroupTasks(@Param("groupIdsList") List<UUID> groupIdsList,
			@Param("tenantId") String tenantId, @Param("date") LocalDateTime date,
			@Param("workspaceId") List<UUID> workspaceId, Pageable pageable);

	@Query("select p.processDefinitionTask.taskName from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId in :workspaceId and "
			+ " (p.assignedTo = :userId or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and (x.userId = :userId)))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public Set<String> getAllUserTaskNames(@Param("userId") UUID userid, @Param("tenantId") String tenantId,
			@Param("date") LocalDateTime date, @Param("workspaceId") List<UUID> workspaceId);

	@Query("select p.processDefinitionTask.taskName from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId in :workspaceId and "
			+ " (p.assignedToGroup in :groupIdsList or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and (x.groupId in :groupIdsList)))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public Set<String> getAllGroupTaskNames(@Param("groupIdsList") List<UUID> groupIdsList,
			@Param("tenantId") String tenantId, @Param("date") LocalDateTime date,
			@Param("workspaceId") List<UUID> workspaceId);

	@Query("select p from ProcessInstanceTask p where "
			+ " (p.assignedTo = :userId or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and (x.userId = :userId)))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskName=:taskName and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public List<ProcessInstanceTask> getAllUserTasks(@Param("taskName") String taskName, @Param("userId") UUID userid,
			@Param("tenantId") String tenantId, @Param("date") LocalDateTime date, Pageable pageable);

	@Query("select p from ProcessInstanceTask p where "
			+ " (p.assignedToGroup in :groupIdsList or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and (x.groupId in :groupIdsList)))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskName=:taskName and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public List<ProcessInstanceTask> getAllGroupTasks(@Param("taskName") String taskName,
			@Param("groupIdsList") List<UUID> groupIdsList, @Param("tenantId") String tenantId,
			@Param("date") LocalDateTime date, Pageable pageable);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId in :workspaceId and "
			+ " (p.assignedTo = :userId or p.assignedToGroup in :groupIdsList or  (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and (x.groupId in :groupIdsList or x.userId = :userId)))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public List<ProcessInstanceTask> getAllTasks(@Param("userId") UUID userid,
			@Param("groupIdsList") List<UUID> groupIdsList, @Param("tenantId") String tenantId,
			@Param("date") LocalDateTime date, @Param("workspaceId") List<UUID> workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId in :workspaceId and "
			+ " (p.assignedTo = :userId or p.assignedToGroup in :groupIdsList or  (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and (x.groupId in :groupIdsList or x.userId = :userId)))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public List<ProcessInstanceTask> getAllTasksWithPagination(@Param("userId") UUID userid,
			@Param("groupIdsList") List<UUID> groupIdsList, @Param("tenantId") String tenantId,
			@Param("date") LocalDateTime date, @Param("workspaceId") List<UUID> workspaceId, Pageable pageable);

	@Query("select count(p) from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId in :workspaceId and "
			+ " (p.assignedTo = :userId or p.assignedToGroup in :groupIdsList or  (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and (x.groupId in :groupIdsList or x.userId = :userId)))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public int getAllTasksWithPaginationCount(@Param("userId") UUID userid,
			@Param("groupIdsList") List<UUID> groupIdsList, @Param("tenantId") String tenantId,
			@Param("date") LocalDateTime date, @Param("workspaceId") List<UUID> workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and "
			+ " (p.assignedTo = :userId or p.assignedToGroup in :groupIdsList or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and (x.userId = :userId or x.groupId in :groupIdsList)))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskName=:taskName and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public List<ProcessInstanceTask> getTasksByTaskType(@Param("userId") UUID userid,
			@Param("groupIdsList") List<UUID> groupIdsList, @Param("taskName") String taskName,
			@Param("tenantId") String tenantId, @Param("date") LocalDateTime date,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId in :workspaceId and "
			+ " (p.assignedToGroup in :groupIdsList or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and (x.groupId in :groupIdsList)))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskName=:taskName and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public List<ProcessInstanceTask> getGroupTasksByTaskType(@Param("groupIdsList") List<UUID> groupIdsList,
			@Param("taskName") String taskName, @Param("tenantId") String tenantId, @Param("date") LocalDateTime date,
			@Param("workspaceId") List<UUID> workspaceId, Pageable pageable);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId in :workspaceId and "
			+ " (p.assignedTo = :userId  or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and (x.userId = :userId)))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskName=:taskName and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public List<ProcessInstanceTask> getUserTasksByTaskType(@Param("userId") UUID userid,
			@Param("taskName") String taskName, @Param("tenantId") String tenantId, @Param("date") LocalDateTime date,
			@Param("workspaceId") List<UUID> workspaceId, Pageable pageable);

	@Query("select count(p) from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId in :workspaceId and "
			+ " (p.assignedTo = :userId or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and x.userId = :userId))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskName=:taskName and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public int getPendingUserTasksCountByTaskname(@Param("userId") UUID userid, @Param("taskName") String taskName,
			@Param("tenantId") String tenantId, @Param("date") LocalDateTime date,
			@Param("workspaceId") List<UUID> workspaceId);

	@Query("select count(p) from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId in :workspaceId and "
			+ " (p.assignedToGroup in :groupIdsList or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and x.groupId in :groupIdsList))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskName=:taskName and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public int getPendingGroupTasksCountByTaskname(@Param("groupIdsList") List<UUID> groupIdsList,
			@Param("taskName") String taskName, @Param("tenantId") String tenantId, @Param("date") LocalDateTime date,
			@Param("workspaceId") List<UUID> workspaceId);

	@Query("select count(p) from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and "
			+ " (p.assignedTo = :userId or p.assignedToGroup in :groupIdsList or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and x.groupId in :groupIdsList))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public int getAllTasksCount(@Param("userId") UUID userid, @Param("groupIdsList") List<UUID> groupIdsList,
			@Param("tenantId") String tenantId, @Param("date") LocalDateTime date,
			@Param("workspaceId") UUID workspaceId);

	@Query("select count(p) from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId in :workspaceId and "
			+ " (p.assignedTo = :userId or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and x.userId = :userId))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public int getPendingUserTasksCount(@Param("userId") UUID userid, @Param("tenantId") String tenantId,
			@Param("date") LocalDateTime date, @Param("workspaceId") List<UUID> workspaceId);

	@Query("select count(p) from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId in :workspaceId and "
			+ " (p.assignedToGroup in :groupIdsList or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and x.groupId in :groupIdsList))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public int getPendingGroupTasksCount(@Param("groupIdsList") List<UUID> groupIdsList,
			@Param("tenantId") String tenantId, @Param("date") LocalDateTime date,
			@Param("workspaceId") List<UUID> workspaceId);

	@Query("select count(p) from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and "
			+ " (p.assignedTo = :userId or p.assignedToGroup in :groupIdsList or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and (x.userId = :userId or x.groupId in :groupIdsList)))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public int getProcessTasksCount(@Param("groupIdsList") List<UUID> groupIdsList, @Param("userId") UUID userid,
			@Param("tenantId") String tenantId, @Param("date") LocalDateTime date,
			@Param("workspaceId") UUID workspaceId);

	@Query("select count(p) from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and "
			+ " (p.assignedTo = :userId or p.assignedToGroup in :groupIdsList or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and (x.userId = :userId or x.groupId in :groupIdsList)))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.createdDate between :startDate and :endDate) ")
	public int getProcessTasksCountBasedOnFilter(@Param("groupIdsList") List<UUID> groupIdsList,
			@Param("userId") UUID userid, @Param("tenantId") String tenantId,
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate,
			@Param("workspaceId") UUID workspaceId);

	@Query("select count(p) from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and "
			+ " (p.assignedTo = :userId or p.assignedToGroup in :groupIdsList or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and (x.userId = :userId or x.groupId in :groupIdsList)))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate between :startDate and :endDate) ")
	public int getProcessDueTasksCountBasedOnFilter(@Param("groupIdsList") List<UUID> groupIdsList,
			@Param("userId") UUID userid, @Param("tenantId") String tenantId,
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and "
			+ " (p.assignedTo = :userId or p.assignedToGroup in :groupIdsList or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and (x.userId = :userId or x.groupId in :groupIdsList)))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate between :startDate and :endDate) ")
	public List<ProcessInstanceTask> getProcessDueTasksBasedOnFilter(@Param("groupIdsList") List<UUID> groupIdsList,
			@Param("userId") UUID userid, @Param("tenantId") String tenantId,
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate,
			@Param("workspaceId") UUID workspaceId, Pageable pageable);

	@Query("select count(p) from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and "
			+ " (p.assignedTo = :userId or p.assignedToGroup in :groupIdsList or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and (x.userId = :userId or x.groupId in :groupIdsList)))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate between :startDate and :endDate) ")
	public int getProcessDueTasksBasedOnFilterCount(@Param("groupIdsList") List<UUID> groupIdsList,
			@Param("userId") UUID userid, @Param("tenantId") String tenantId,
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate,
			@Param("workspaceId") UUID workspaceId);

	@Query("select count(p) from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and "
			+ " (p.assignedTo = :userId or p.assignedToGroup in :groupIdsList or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and (x.userId = :userId or x.groupId in :groupIdsList)))) "
			+ " and (p.status = 'COMPLETED') and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.endTime between :startDate and :endDate) ")
	public int getCompletedTasksCountBasedOnFilter(@Param("groupIdsList") List<UUID> groupIdsList,
			@Param("userId") UUID userid, @Param("tenantId") String tenantId,
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate,
			@Param("workspaceId") UUID workspaceId);

	@Query("select count(p) from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and "
			+ " (p.assignedTo = :userId or p.assignedToGroup in :groupIdsList or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and (x.userId = :userId or x.groupId in :groupIdsList)))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate <= :date) ")
	public int getDueTasksCount(@Param("groupIdsList") List<UUID> groupIdsList, @Param("userId") UUID userid,
			@Param("tenantId") String tenantId, @Param("date") LocalDateTime date,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId in :workspaceId and "
			+ " (p.assignedTo = :userId or p.assignedToGroup in :groupIdsList or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and x.userId = :userId))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.data is not null and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public List<ProcessInstanceTask> getDraftTask(@Param("userId") UUID userid,
			@Param("groupIdsList") List<UUID> groupIdsList, @Param("tenantId") String tenantId,
			@Param("date") LocalDateTime date, @Param("workspaceId") List<UUID> workspaceId, Pageable pageable);

	@Query("select count(p) from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId in :workspaceId and "
			+ " (p.assignedTo = :userId or p.assignedToGroup in :groupIdsList or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and x.userId = :userId))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.data is not null and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public int getDraftTaskCount(@Param("userId") UUID userid, @Param("groupIdsList") List<UUID> groupIdsList,
			@Param("tenantId") String tenantId, @Param("date") LocalDateTime date,
			@Param("workspaceId") List<UUID> workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId in :workspaceId and p.status = 'COMPLETED' and (p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK') or (p.processDefinitionTask.taskType ='START_TASK' and p.processInstance.processDefinition.startType = 'manual')) "
			+ " and p.updatedBy =:username and p.tenantId = :tenantId ")
	public List<ProcessInstanceTask> getDoneList(@Param("username") String userName, @Param("tenantId") String tenantId,
			@Param("workspaceId") List<UUID> workspaceId, Pageable pageable);

	@Query("select count(p) from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId in :workspaceId and p.status = 'COMPLETED' and (p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK') or (p.processDefinitionTask.taskType ='START_TASK' and p.processInstance.processDefinition.startType = 'manual')) "
			+ " and p.updatedBy =:username and p.tenantId = :tenantId")
	public int getDoneListCount(@Param("username") String userName, @Param("tenantId") String tenantId,
			@Param("workspaceId") List<UUID> workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and p.dueDate <:dateTime and p.status <>:status and ( p.processDefinitionTask.taskType =:task_type or p.processDefinitionTask.taskType ='APPROVAL_TASK' or p.processDefinitionTask.taskType ='START_TASK') and (p.processDefinitionTask.processDefinition.userName =:user_name and p.tenantId = :tenantId) order by p.createdDate desc")
	public List<ProcessInstanceTask> getTasksPassedDueDateList(Pageable pagination,
			@Param("dateTime") LocalDateTime dateTime, @Param("status") String taskStatus,
			@Param("task_type") String taskType, @Param("user_name") String userName,
			@Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	@Query("select  count(c) from ProcessInstanceTask c where c.processDefinitionTask.processDefinition.workspaceId =:workspaceId and c.dueDate <:dateTime and c.status <>:status and (c.processDefinitionTask.taskType =:task_type or c.processDefinitionTask.taskType ='APPROVAL_TASK' or c.processDefinitionTask.taskType ='START_TASK') and (c.processDefinitionTask.processDefinition.userName =:user_name and c.tenantId = :tenantId)")
	public String getTasksPassedDueDateListCount(@Param("dateTime") LocalDateTime dateTime,
			@Param("status") String taskStatus, @Param("task_type") String taskType,
			@Param("user_name") String userName, @Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId);

	@Query("select count(c) from ProcessInstanceTask c where c.processDefinitionTask.processDefinition.workspaceId =:workspaceId and ( c.status <>:status or c.status is null ) and (c.processDefinitionTask.taskType =:task_type or c.processDefinitionTask.taskType ='APPROVAL_TASK' or c.processDefinitionTask.taskType ='START_TASK') and  c.tenantId = :tenantId")
	public String getPendingListCount(@Param("status") String taskStatus, @Param("task_type") String taskType,
			@Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	@Query("select count(c) from ProcessInstanceTask c where  c.processDefinitionTask.processDefinition.workspaceId =:workspaceId and c.status = :status and (c.processDefinitionTask.taskType =:task_type or c.processDefinitionTask.taskType ='APPROVAL_TASK' or c.processDefinitionTask.taskType ='START_TASK') and (c.updatedBy =:user_name and c.tenantId = :tenantId)")
	public String getDoneListCount(@Param("status") String taskStatus, @Param("task_type") String taskType,
			@Param("user_name") String userName, @Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processInstance.processInstanceId =:processInstanceId and p.data is not null and p.tenantId = :tenantId order by p.updatedDate asc")
	public List<ProcessInstanceTask> getInstanceTaskByLastUpdateDate(@Param("processInstanceId") UUID processInstanceId,
			@Param("tenantId") String tenantId);

	@Query("select p from ProcessInstanceTask p where p.processInstance.processInstanceId =:processInstanceId and p.processDefinitionTask.taskType = 'CALL_ANOTHER_WORKFLOW' and p.tenantId = :tenantId ")
	public List<ProcessInstanceTask> getCallAnotherWFInstanceTask(@Param("processInstanceId") UUID processInstanceId,
			@Param("tenantId") String tenantId);

	@Query("select p from ProcessInstanceTask p where (p.status <> :status or p.status is null) and p.dueDate <= :currentTime and  p.tenantId = :tenantId and (p.dueDateEventProcessedOn is null or p.dueDateEventProcessedOn < p.dueDate) order by p.createdDate desc")
	public Stream<ProcessInstanceTask> getPastDueDateTasks(@Param("status") String taskStatus,
			@Param("currentTime") LocalDateTime currentTime, @Param("tenantId") String tenantId);

	@Query("select p from ProcessInstanceTask p where p.processInstance.processInstanceId =:processInstanceId and p.processInstanceTaskId =:processInstanceTaskId and p.tenantId = :tenantId")
	public ProcessInstanceTask getInstance(@Param("processInstanceId") UUID processInstanceId,
			@Param("processInstanceTaskId") UUID processInstanceTaskId, @Param("tenantId") String tenantId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and (p.createdDate >=:start_date and p.createdDate <=:end_date) "
			+ "and p.processDefinitionTask.taskType =:task_type and p.tenantId=:tenantId order by p.createdDate asc")
	public Set<ProcessInstanceTask> getTotalTaskByStartDate(@Param("start_date") LocalDateTime startDate,
			@Param("end_date") LocalDateTime endDate, @Param("task_type") String taskType,
			@Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and (p.createdDate >=:start_date and p.createdDate <=:end_date) "
			+ "and p.processDefinitionTask.taskType =:task_type and p.status=:status and p.tenantId=:tenantId order by p.createdDate asc")
	public List<ProcessInstanceTask> getTotalCompletedTaskByStartDate(@Param("start_date") LocalDateTime startDate,
			@Param("end_date") LocalDateTime endDate, @Param("task_type") String taskType,
			@Param("status") String status, @Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and (p.updatedDate >=:start_date and p.updatedDate <=:end_date) and "
			+ "p.assignedTo=:userId and p.processDefinitionTask.taskType =:task_type and p.status=:status and  p.tenantId = :tenantId order by p.createdDate desc")
	public List<ProcessInstanceTask> getTotalUserTaskByCreatedDate(@Param("start_date") LocalDateTime startDate,
			@Param("end_date") LocalDateTime endDate, @Param("userId") UUID userId, @Param("task_type") String taskType,
			@Param("status") String status, @Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and (p.endTime >=:start_date and p.endTime <=:end_date) and "
			+ "p.processDefinitionTask.taskType =:task_type and p.status=:status  and  p.tenantId = :tenantId order by p.endTime desc")
	public List<ProcessInstanceTask> getTaskByEndTime(@Param("start_date") LocalDateTime startDate,
			@Param("end_date") LocalDateTime endDate, @Param("task_type") String taskType,
			@Param("status") String status, @Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and (p.endTime >=:start_date and p.endTime <=:end_date) and "
			+ "p.processDefinitionTask.taskType =:task_type and p.processDefinitionTask.taskName =:taskName and p.status=:status  and  p.tenantId = :tenantId order by p.endTime desc")
	public List<ProcessInstanceTask> getTaskNameByEndTime(@Param("start_date") LocalDateTime startDate,
			@Param("end_date") LocalDateTime endDate, @Param("task_type") String taskType,
			@Param("taskName") String taskName, @Param("status") String status, @Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId);

	@Query(value = "select cast(end_time as date) as \"completion_date\", task_name, sum(mins) / count(1) as \"mins\" from ( "
			+ " select in_task.end_time, def_task.task_name, extract(EPOCH FROM (in_task.end_time  - in_task.start_time )) / 60 as \"mins\" "
			+ " from process_instance_tasks in_task, process_definition_tasks def_task "
			+ " where def_task.task_id  = in_task.task_id and def_task.task_type = 'USER_TASK' and in_task.status  = 'COMPLETED' "
			+ " and in_task.end_time  between :startDate and :endDate and in_task.tenant_id = :tenantId) report "
			+ " group by completion_date, task_name order by completion_date", nativeQuery = true)
	public List<Object[]> getTotalCompletedAverageTimeByTasks(@Param("startDate") LocalDateTime startDate,
			@Param("endDate") LocalDateTime endDate, @Param("tenantId") String tenantId);

	@Query(value = "select cast(in_task.created_date as date) as \"task_date\", in_task.status, count(1) as \"cnt\"  "
			+ " from process_instance_tasks in_task, process_definition_tasks def_task "
			+ " where def_task.task_id  = in_task.task_id and def_task.task_type = 'USER_TASK' "
			+ " and in_task.created_date between :startDate and :endDate and in_task.tenant_id = :tenantId "
			+ " group by task_date, in_task.status", nativeQuery = true)
	public List<Object[]> getTotalTasksByStatus(@Param("startDate") LocalDateTime startDate,
			@Param("endDate") LocalDateTime endDate, @Param("tenantId") String tenantId);

	@Query(value = "select cast(in_task.end_time as date) as \"task_date\", u.user_name, count(1) as \"cnt\" "
			+ " from process_instance_tasks in_task, process_definition_tasks def_task, users u \n"
			+ " where def_task.task_id  = in_task.task_id and def_task.task_type = 'USER_TASK' and in_task.status  = 'COMPLETED' "
			+ " and u.user_id = in_task.assigned_to "
			+ " and in_task.end_time is not null and in_task.end_time between :startDate and :endDate and in_task.tenant_id = :tenantId "
			+ " group by task_date, user_name, in_task.status", nativeQuery = true)
	public List<Object[]> getTotalTasksByUser(@Param("startDate") LocalDateTime startDate,
			@Param("endDate") LocalDateTime endDate, @Param("tenantId") String tenantId);

	@Query(value = "select cast(in_task.end_time as date) as \"task_date\", u.user_name, count(1) as \"cnt\" "
			+ " from process_instance_tasks in_task, process_definition_tasks def_task, users u \n"
			+ " where def_task.task_id  = in_task.task_id and def_task.task_type = 'USER_TASK' and in_task.status  = 'COMPLETED' "
			+ " and u.user_id = in_task.assigned_to and u.user_id = :userId "
			+ " and in_task.end_time is not null and in_task.end_time between :startDate and :endDate and in_task.tenant_id = :tenantId "
			+ " group by task_date, user_name, in_task.status", nativeQuery = true)
	public List<Object[]> getTotalTasksByUser(@Param("startDate") LocalDateTime startDate,
			@Param("endDate") LocalDateTime endDate, @Param("tenantId") String tenantId, @Param("userId") UUID userId);

	@Query("select p from ProcessInstanceTask p where p.processInstance.processInstanceId=:processInstanceId and p.tenantId=:tenantId and (p.processDefinitionTask.taskType <> 'SEQ_FLOW' and p.processDefinitionTask.taskType <> 'END_TASK' )")
	public List<ProcessInstanceTask> getTaskList(Pageable pageable, @Param("processInstanceId") UUID processInstanceId,
			@Param("tenantId") String tenantId);

	@Query("select count(p) from ProcessInstanceTask p where p.processInstance.processInstanceId=:processInstanceId and p.tenantId=:tenantId and (p.processDefinitionTask.taskType <> 'SEQ_FLOW' and p.processDefinitionTask.taskType <> 'END_TASK' )")
	public String getTaskListCount(@Param("processInstanceId") UUID processInstanceId,
			@Param("tenantId") String tenantId);

	@Query("select p from ProcessInstanceTask p where p.processInstance.processInstanceId=:processInstanceId and p.tenantId=:tenantId and (p.processDefinitionTask.taskType <> 'SEQ_FLOW' and p.processDefinitionTask.taskType <> 'END_TASK' ) order by p.startTime asc")
	public List<ProcessInstanceTask> getTaskListWithFilter(@Param("processInstanceId") UUID processInstanceId,
			@Param("tenantId") String tenantId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and "
			+ " (p.assignedTo = :userId or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and x.userId = :userId))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public List<ProcessInstanceTask> getFilterValuesForPendingUserTasks(@Param("userId") UUID userid,
			@Param("tenantId") String tenantId, @Param("date") LocalDateTime date,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and "
			+ " (p.assignedToGroup in :groupIdsList or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and x.groupId in :groupIdsList))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public List<ProcessInstanceTask> getFilterValuesForPendingGroupTasks(@Param("groupIdsList") List<UUID> groupIdsList,
			@Param("tenantId") String tenantId, @Param("date") LocalDateTime date,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and "
			+ " (p.assignedTo = :userId or p.assignedToGroup in :groupIdsList or (p.assignedTo is null and p.assignedToGroup is null and "
			+ " exists (select x from ProcessDefTaskPrmsn x where x.processDefinitionTask = p.processDefinitionTask and x.userId = :userId))) "
			+ " and (p.status = 'IN_PROCESS' or p.status is null) and p.data is not null and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') and p.tenantId = :tenantId"
			+ " and (p.dueDate is null or p.dueDate <= :date) ")
	public List<ProcessInstanceTask> getDraftTaskForFilter(@Param("userId") UUID userid,
			@Param("groupIdsList") List<UUID> groupIdsList, @Param("tenantId") String tenantId,
			@Param("date") LocalDateTime date, @Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and p.status = 'COMPLETED' and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') "
			+ " and p.updatedBy =:username and p.tenantId = :tenantId ")
	public List<ProcessInstanceTask> getFilterValuesForDoneList(@Param("username") String userName,
			@Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.taskId =:taskId and p.processInstance.processInstanceId =:processInstanceId and p.tenantId = :tenantId order by p.createdDate desc")
	public List<ProcessInstanceTask> getTaskForSendBack(@Param("taskId") UUID taskId,
			@Param("processInstanceId") UUID processInstanceId, @Param("tenantId") String tenantId);

	@Query("select p from ProcessInstanceTask p where p.processInstance.processInstanceId=:processInstanceId and p.tenantId=:tenantId and p.processDefinitionTask.taskType = 'APPROVAL_TASK'")
	public List<ProcessInstanceTask> getTaskListWithSendBack(@Param("processInstanceId") UUID processInstanceId,
			@Param("tenantId") String tenantId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.taskId=:taskId and p.tenantId=:tenantId and p.processInstance.processInstanceId =:processInstanceId order by p.createdDate desc")
	public List<ProcessInstanceTask> getTaskWithTaskId(@Param("taskId") UUID taskId,
			@Param("processInstanceId") UUID processInstanceId, @Param("tenantId") String tenantId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and p.status = 'IN_PROCESS' and p.tenantId=:tenantId and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK')")
	public List<ProcessInstanceTask> getRunningProcessTaskList(Pageable pageable, @Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and p.status = 'IN_PROCESS' and p.processInstance.startTime between :startDate and :endDate and p.tenantId=:tenantId and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK')")
	public List<ProcessInstanceTask> getRunningProcessTaskListBasedOnSearch(@Param("startDate") LocalDateTime startDate,
			@Param("endDate") LocalDateTime endDate, Pageable pageable, @Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and p.status = 'IN_PROCESS' and p.processInstance.startTime between :startDate and :endDate and p.tenantId=:tenantId and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') order by p.processInstance.startTime desc")
	public List<ProcessInstanceTask> getRunningProcessTaskListBasedOnSearchWithoutPagination(
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate,
			@Param("tenantId") String tenantId, @Param("workspaceId") UUID workspaceId);

	@Query("select count(p) from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and p.status = 'IN_PROCESS' and p.processInstance.startTime between :startDate and :endDate and p.tenantId=:tenantId and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK')")
	public String getRunningProcessTaskListBasedOnSearchCount(@Param("startDate") LocalDateTime startDate,
			@Param("endDate") LocalDateTime endDate, @Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId);

	@Query("select p from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and p.status = 'IN_PROCESS' and p.tenantId=:tenantId and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK')")
	public List<ProcessInstanceTask> getRunningProcessTaskListForWildCardSearch(@Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId);

	@Query("select count(p) from ProcessInstanceTask p where p.processDefinitionTask.processDefinition.workspaceId =:workspaceId and p.status = 'IN_PROCESS' and p.tenantId=:tenantId and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK')")
	public String getRunningProcessTaskListCount(@Param("tenantId") String tenantId,
			@Param("workspaceId") UUID workspaceId);

//	@Query("select p from ProcessInstanceTask p where p.processInstance.status = 'COMPLETED' and p.status = 'COMPLETED' and p.tenantId=:tenantId and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK')")
//	public List<ProcessInstanceTask> getCompletedProcessTaskList(Pageable pageable, @Param("tenantId") String tenantId);
//	
//	@Query("select count(p) from ProcessInstanceTask p where p.processInstance.status = 'COMPLETED' and p.status = 'COMPLETED' and p.tenantId=:tenantId and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK')")
//	public String getCompletedProcessTaskListCount(@Param("tenantId") String tenantId);

	@Query("select p from ProcessInstanceTask p where p.processInstance.processInstanceId=:processInstanceId and p.tenantId=:tenantId and p.processDefinitionTask.taskType in ('USER_TASK', 'APPROVAL_TASK', 'START_TASK') order by p.endTime desc")
	public List<ProcessInstanceTask> getCompletedProcessTaskListByOrder(
			@Param("processInstanceId") UUID processInstanceId, @Param("tenantId") String tenantId);
	
	@Query("select p from ProcessInstanceTask p where p.processInstance.processInstanceId=:processInstanceId and p.tenantId=:tenantId ")
	public List<ProcessInstanceTask> getTaskNameFromInstanceId(
			@Param("processInstanceId") UUID processInstanceId, @Param("tenantId") String tenantId);

	@Query("select p from ProcessInstanceTask p where p.status =:status and p.remainderTask is not null and  p.tenantId = :tenantId order by p.createdDate desc")
	public List<ProcessInstanceTask> getRemainderTask(@Param("status") String taskStatus,
			@Param("tenantId") String tenantId);

	@Query("select p from ProcessInstanceTask p where p.processInstance.processInstanceId=:processInstanceId and p.processDefinitionTask.taskType = 'START_TASK' and p.status = 'IN_PROCESS' and  p.tenantId = :tenantId")
	public ProcessInstanceTask getProcessInstanceTaskByInstanceId(@Param("processInstanceId") UUID processInstanceId,
			@Param("tenantId") String tenantId);

	@Query("select p.processInstanceTaskId from ProcessInstanceTask p where p.processInstance.processInstanceId=:processInstanceId and p.tenantId=:tenantId and (p.processDefinitionTask.taskType <> 'SEQ_FLOW' and p.processDefinitionTask.taskType <> 'END_TASK' )")
	public List<UUID> getTaskListWithoutPagination(@Param("processInstanceId") UUID processInstanceId,
			@Param("tenantId") String tenantId);

	@Query(value = "select * from process_instance_tasks as p left join process_definition_tasks as pdt on "
			+ "pdt.task_id = p.task_id and pdt.tenant_id =:tenantId and pdt.task_type in "
			+ "('USER_TASK', 'APPROVAL_TASK', 'START_TASK') left join process_definitions as pd on "
			+ "pd.process_definition_id = pdt.process_definition_id and pd.active_flag =:activeFlag and "
			+ "pd.tenant_id =:tenantId where (p.assigned_to =:userId or p.assigned_to_group in :groupIdsList or "
			+ "(p.assigned_to is null and p.assigned_to_group is null and exists (select x from "
			+ "process_def_task_permission x where x.task_id = p.task_id and (x.group_id in :groupIdsList or "
			+ "x.user_id =:userId)))) and (p.status = 'IN_PROCESS' or p.status is null) and "
			+ "p.tenant_id =:tenantId and (p.due_date is null or p.due_date <=:date) and (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = pd.workspace_id) then (exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = pd.workspace_id and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)", nativeQuery = true)
	public List<ProcessInstanceTask> getProcessInstanceTaskForAllWorkspacePageable(@Param("userId") UUID userId,
			@Param("groupIdsList") List<UUID> groupIdsList, @Param("tenantId") String tenantId,
			@Param("date") LocalDateTime date, Pageable pageable, @Param("activeFlag") String activeFlag);

	@Query(value = "select count(*) from process_instance_tasks as p left join process_definition_tasks as pdt on "
			+ "pdt.task_id = p.task_id and pdt.tenant_id =:tenantId and pdt.task_type in "
			+ "('USER_TASK', 'APPROVAL_TASK', 'START_TASK') left join process_definitions as pd on "
			+ "pd.process_definition_id = pdt.process_definition_id and pd.active_flag =:activeFlag and "
			+ "pd.tenant_id =:tenantId where (p.assigned_to =:userId or p.assigned_to_group in :groupIdsList or "
			+ "(p.assigned_to is null and p.assigned_to_group is null and exists (select x from "
			+ "process_def_task_permission x where x.task_id = p.task_id and (x.group_id in :groupIdsList or "
			+ "x.user_id =:userId)))) and (p.status = 'IN_PROCESS' or p.status is null) and "
			+ "p.tenant_id =:tenantId and (p.due_date is null or p.due_date <=:date) and (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = pd.workspace_id) then (exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = pd.workspace_id and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)", nativeQuery = true)
	public int getProcessInstanceTaskCountForAllWorkspace(@Param("userId") UUID userId,
			@Param("groupIdsList") List<UUID> groupIdsList, @Param("tenantId") String tenantId,
			@Param("date") LocalDateTime date, @Param("activeFlag") String activeFlag);

	@Query(value = "select * from process_instance_tasks as p left join process_definition_tasks as pdt on "
			+ "pdt.task_id = p.task_id and pdt.tenant_id =:tenantId and pdt.task_type in "
			+ "('USER_TASK', 'APPROVAL_TASK', 'START_TASK') left join process_definitions as pd on "
			+ "pd.process_definition_id = pdt.process_definition_id and pd.active_flag =:activeFlag and "
			+ "pd.tenant_id =:tenantId where (p.assigned_to =:userId or p.assigned_to_group in :groupIdsList or "
			+ "(p.assigned_to is null and p.assigned_to_group is null and exists (select x from "
			+ "process_def_task_permission x where x.task_id = p.task_id and (x.group_id in :groupIdsList or "
			+ "x.user_id =:userId)))) and (p.status = 'IN_PROCESS' or p.status is null) and "
			+ "p.tenant_id =:tenantId and (p.due_date is null or p.due_date <=:date) and "
			+ "p.created_date between :startDate and :endDate and (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = pd.workspace_id) then (exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = pd.workspace_id and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)", nativeQuery = true)
	public List<ProcessInstanceTask> getProcessInstanceTaskForAllWorkspacePageableWithDateFilter(
			@Param("userId") UUID userId, @Param("groupIdsList") List<UUID> groupIdsList,
			@Param("tenantId") String tenantId, @Param("date") LocalDateTime date, Pageable pageable,
			@Param("activeFlag") String activeFlag, @Param("startDate") Timestamp startDate,
			@Param("endDate") Timestamp endDate);

	@Query(value = "select count(*) from process_instance_tasks as p left join process_definition_tasks as pdt on "
			+ "pdt.task_id = p.task_id and pdt.tenant_id =:tenantId and pdt.task_type in "
			+ "('USER_TASK', 'APPROVAL_TASK', 'START_TASK') left join process_definitions as pd on "
			+ "pd.process_definition_id = pdt.process_definition_id and pd.active_flag =:activeFlag and "
			+ "pd.tenant_id =:tenantId where (p.assigned_to =:userId or p.assigned_to_group in :groupIdsList or "
			+ "(p.assigned_to is null and p.assigned_to_group is null and exists (select x from "
			+ "process_def_task_permission x where x.task_id = p.task_id and (x.group_id in :groupIdsList or "
			+ "x.user_id =:userId)))) and (p.status = 'IN_PROCESS' or p.status is null) and "
			+ "p.tenant_id =:tenantId and (p.due_date is null or p.due_date <=:date) and "
			+ "p.created_date between :startDate and :endDate and (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = pd.workspace_id) then (exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = pd.workspace_id and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)", nativeQuery = true)
	public int getProcessInstanceTaskCountForAllWorkspaceWithDateFilter(@Param("userId") UUID userId,
			@Param("groupIdsList") List<UUID> groupIdsList, @Param("tenantId") String tenantId,
			@Param("date") LocalDateTime date, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select * from process_instance_tasks as p left join process_definition_tasks as pdt on "
			+ "pdt.task_id = p.task_id and pdt.tenant_id =:tenantId and pdt.task_type in "
			+ "('USER_TASK', 'APPROVAL_TASK', 'START_TASK') left join process_definitions as pd on "
			+ "pd.process_definition_id = pdt.process_definition_id and pd.active_flag =:activeFlag and "
			+ "pd.tenant_id =:tenantId where (p.assigned_to =:userId or p.assigned_to_group in :groupIdsList or "
			+ "(p.assigned_to is null and p.assigned_to_group is null and exists (select x from "
			+ "process_def_task_permission x where x.task_id = p.task_id and (x.group_id in :groupIdsList or "
			+ "x.user_id =:userId)))) and (p.status = 'IN_PROCESS' or p.status is null) and "
			+ "p.tenant_id =:tenantId and (p.due_date is null or p.due_date <=:date) and (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = pd.workspace_id) then (exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = pd.workspace_id and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)", nativeQuery = true)
	public List<ProcessInstanceTask> getProcessInstanceTaskForAllWorkspace(@Param("userId") UUID userId,
			@Param("groupIdsList") List<UUID> groupIdsList, @Param("tenantId") String tenantId,
			@Param("date") LocalDateTime date, @Param("activeFlag") String activeFlag);

	@Query(value = "select * from process_instance_tasks as p left join process_definition_tasks as pdt on "
			+ "pdt.task_id = p.task_id and pdt.tenant_id =:tenantId and pdt.task_type in "
			+ "('USER_TASK', 'APPROVAL_TASK', 'START_TASK') left join process_definitions as pd on "
			+ "pd.process_definition_id = pdt.process_definition_id and pd.active_flag =:activeFlag and "
			+ "pd.tenant_id =:tenantId where (p.assigned_to =:userId or p.assigned_to_group in :groupIdsList or "
			+ "(p.assigned_to is null and p.assigned_to_group is null and exists (select x from "
			+ "process_def_task_permission x where x.task_id = p.task_id and (x.group_id in :groupIdsList or "
			+ "x.user_id =:userId)))) and (p.status = 'IN_PROCESS' or p.status is null) and "
			+ "p.tenant_id =:tenantId and (p.due_date is null or p.due_date <=:date) and "
			+ "p.created_date between :startDate and :endDate and (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = pd.workspace_id) then (exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = pd.workspace_id and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)", nativeQuery = true)
	public List<ProcessInstanceTask> getProcessInstanceTaskForAllWorkspaceWithDateFilter(@Param("userId") UUID userId,
			@Param("groupIdsList") List<UUID> groupIdsList, @Param("tenantId") String tenantId,
			@Param("date") LocalDateTime date, @Param("activeFlag") String activeFlag,
			@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);

	@Query(value = "select count(*) from process_instance_tasks as p left join process_definition_tasks as pdt on "
			+ "pdt.task_id = p.task_id and pdt.tenant_id =:tenantId and pdt.task_type in "
			+ "('USER_TASK', 'APPROVAL_TASK', 'START_TASK') left join process_definitions as pd on "
			+ "pd.process_definition_id = pdt.process_definition_id and pd.active_flag =:activeFlag and "
			+ "pd.tenant_id =:tenantId where (p.assigned_to =:userId or p.assigned_to_group in :groupIdsList or "
			+ "(p.assigned_to is null and p.assigned_to_group is null and exists (select x from "
			+ "process_def_task_permission x where x.task_id = p.task_id and (x.group_id in :groupIdsList or "
			+ "x.user_id =:userId)))) and (p.status = 'IN_PROCESS' or p.status is null) and "
			+ "p.tenant_id =:tenantId and (p.created_date between :startDate and :endDate and p.due_date "
			+ "between :startDate and :endDate) and (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = pd.workspace_id) then (exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = pd.workspace_id and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)", nativeQuery = true)
	public int getProcessInstanceTaskCountForAllWorkspace(@Param("userId") UUID userId,
			@Param("groupIdsList") List<UUID> groupIdsList, @Param("tenantId") String tenantId,
			@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select count(*) from process_instance_tasks as p left join process_definition_tasks as pdt on "
			+ "pdt.task_id = p.task_id and pdt.tenant_id =:tenantId and pdt.task_name =:taskName and pdt.task_type in "
			+ "('USER_TASK', 'APPROVAL_TASK', 'START_TASK') left join process_definitions as pd on "
			+ "pd.process_definition_id = pdt.process_definition_id and pd.active_flag =:activeFlag and "
			+ "pd.tenant_id =:tenantId where (p.assigned_to =:userId or "
			+ "(p.assigned_to is null and p.assigned_to_group is null and exists (select x from "
			+ "process_def_task_permission x where x.task_id = p.task_id and ("
			+ "x.user_id =:userId)))) and (p.status = 'IN_PROCESS' or p.status is null) and "
			+ "p.tenant_id =:tenantId and (p.due_date is null or p.due_date <=:date) and (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = pd.workspace_id) then (exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = pd.workspace_id and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)", nativeQuery = true)
	public int getProcessInstanceTaskForUserTaskByTaskname(@Param("taskName") String taskName,
			@Param("userId") UUID userId, @Param("tenantId") String tenantId, @Param("date") LocalDateTime date,
			@Param("activeFlag") String activeFlag);

	@Query(value = "select count(*) from process_instance_tasks as p left join process_definition_tasks as pdt on "
			+ "pdt.task_id = p.task_id and pdt.tenant_id =:tenantId and pdt.task_name =:taskName and pdt.task_type in "
			+ "('USER_TASK', 'APPROVAL_TASK', 'START_TASK') left join process_definitions as pd on "
			+ "pd.process_definition_id = pdt.process_definition_id and pd.active_flag =:activeFlag and "
			+ "pd.tenant_id =:tenantId where (p.assigned_to_group in :groupIdsList or "
			+ "(p.assigned_to is null and p.assigned_to_group is null and exists (select x from "
			+ "process_def_task_permission x where x.task_id = p.task_id and ("
			+ "x.group_id in :groupIdsList)))) and (p.status = 'IN_PROCESS' or p.status is null) and "
			+ "p.tenant_id =:tenantId and (p.due_date is null or p.due_date <=:date) and (case when exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = pd.workspace_id) then (exists "
			+ "(select * from yoro_workspace_security x where x.workspace_id = pd.workspace_id and "
			+ "x.active_flag =:activeFlag and (x.owner_id =:userId))) else false end)", nativeQuery = true)
	public int getProcessInstanceTaskForGroupTaskByTaskname(@Param("taskName") String taskName,
			@Param("userId") UUID userId, @Param("groupIdsList") List<UUID> groupIdsList,
			@Param("tenantId") String tenantId, @Param("date") LocalDateTime date,
			@Param("activeFlag") String activeFlag);

	@Query("select p from ProcessInstanceTask p where p.processInstanceTaskId=:processInstanceTaskId and p.tenantId = :tenantId")
	public ProcessInstanceTask checkProcessInstanceCompletedTask(
			@Param("processInstanceTaskId") UUID processInstanceTaskId, @Param("tenantId") String tenantId);

	@Query("select p from ProcessInstanceTask p where "
			+ "p.processInstance.processDefinition.workspaceId =:workspaceId and "
			+ "p.processInstance.status='COMPLETED' and "
			+ "p.processInstance.startedBy = :userName and p.processInstance.tenantId = :tenantId and "
			+ "p.processDefinitionTask.taskType in ('START_TASK') and p.tenantId = :tenantId")
	public List<ProcessInstanceTask> getSubmittedTasks(@Param("workspaceId") UUID workspaceId,
			@Param("userName") String userName, @Param("tenantId") String tenantId, Pageable pageable);

	@Query("select count(p) from ProcessInstanceTask p where "
			+ "p.processInstance.processDefinition.workspaceId =:workspaceId and "
			+ "p.processInstance.status='COMPLETED' and "
			+ "p.processInstance.startedBy = :userName and p.processInstance.tenantId = :tenantId and "
			+ "p.processDefinitionTask.taskType in ('START_TASK') and p.tenantId = :tenantId")
	public Long getSubmittedTasksCount(@Param("workspaceId") UUID workspaceId, @Param("userName") String userName,
			@Param("tenantId") String tenantId);
	
	@Query("select p from ProcessInstanceTask p where p.processInstance.processInstanceId=:processInstanceId and p.tenantId=:tenantId "
			+ "and (p.processDefinitionTask.taskType in ('START_TASK', 'USER_TASK', 'APPROVE_TASK'))")
	public List<ProcessInstanceTask> getTaskListCountForProgress(@Param("processInstanceId") UUID processInstanceId,
			@Param("tenantId") String tenantId);
}
