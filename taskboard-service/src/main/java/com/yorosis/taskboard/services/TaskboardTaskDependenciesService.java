package com.yorosis.taskboard.services;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.yorosis.taskboard.models.ResponseStringVO;
import com.yorosis.taskboard.models.TaskDependenciesVO;
import com.yorosis.taskboard.models.TaskboardTaskVO;
import com.yorosis.taskboard.repository.TaskboardTaskDependenciesRepository;
import com.yorosis.taskboard.repository.TaskboardTaskRepository;
import com.yorosis.taskboard.taskboard.entities.TaskboardTask;
import com.yorosis.taskboard.taskboard.entities.TaskboardTaskDependencies;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class TaskboardTaskDependenciesService {
	@Autowired
	private TaskboardTaskDependenciesRepository taskboardTaskDependenciesRepository;

	@Autowired
	private TaskboardTaskRepository taskboardTaskRepository;

	@Autowired
	private ActivityLogService taskboardActivityLogService;

	@Transactional
	public TaskDependenciesVO saveTaskDependencies(TaskDependenciesVO taskDependenciesVO) throws JsonProcessingException {
		TaskDependenciesVO dependencyVO = TaskDependenciesVO.builder().build();
		TaskboardTask task = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskDependenciesVO.getTaskId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskDependenciesVO.getRemoveDependenciesId() != null && !taskDependenciesVO.getRemoveDependenciesId().isEmpty()) {
			removeTaskDependencies(taskDependenciesVO.getRemoveDependenciesId());
		}
		if (taskDependenciesVO.getWaitingOn() != null && !taskDependenciesVO.getWaitingOn().isEmpty()) {
			dependencyVO.setWaitingOn(saveWaitingOnDependencies(taskDependenciesVO, task));
		}
		if (taskDependenciesVO.getBlocking() != null && !taskDependenciesVO.getBlocking().isEmpty()) {
			dependencyVO.setBlocking(saveBlockingDependencies(taskDependenciesVO, task));
		}
		if (taskDependenciesVO.getRelatedTasks() != null && !taskDependenciesVO.getRelatedTasks().isEmpty()) {
			dependencyVO.setRelatedTasks(saveRelatedTasksDependencies(taskDependenciesVO, task));
		}
		return dependencyVO;
	}

	private void removeTaskDependencies(List<UUID> removeDependenciesId) {
		List<TaskboardTaskDependencies> taskboardTaskDependencies = taskboardTaskDependenciesRepository.getTaskDependenciesById(removeDependenciesId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardTaskDependencies != null && !taskboardTaskDependencies.isEmpty()) {
			taskboardTaskDependencies.stream().forEach(d -> d.setActiveFlag(YorosisConstants.NO));
			taskboardTaskDependenciesRepository.saveAll(taskboardTaskDependencies);
		}
	}

	public ResponseStringVO removeTaskDepedency(UUID dependencyId) {
		String response = null;
		TaskboardTaskDependencies taskboardTaskDependency = taskboardTaskDependenciesRepository
				.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(dependencyId, YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardTaskDependency != null) {
			taskboardTaskDependency.setActiveFlag(YorosisConstants.NO);
			taskboardTaskDependency.setModifiedBy(YorosisContext.get().getUserName());
			taskboardTaskDependency.setModifiedOn(new Timestamp(System.currentTimeMillis()));
			taskboardTaskDependenciesRepository.save(taskboardTaskDependency);
			response = "Dependency removed successfully";
		} else {
			response = "Invalid dependency id";
		}
		return ResponseStringVO.builder().response(response).build();
	}

	private List<TaskboardTaskVO> saveWaitingOnDependencies(TaskDependenciesVO taskDependenciesVO, TaskboardTask task) throws JsonProcessingException {
		List<TaskboardTaskDependencies> taskDependencies = new ArrayList<>();
		List<UUID> waitingOnUUID = new ArrayList<>();
		List<TaskboardTaskVO> waitingOn = new ArrayList<>();
		taskDependenciesVO.getWaitingOn().stream().forEach(d -> waitingOnUUID.add(d.getId()));
		List<String> waitingOnList = new ArrayList<>();
		for (TaskboardTask taskboardTask : taskboardTaskRepository.getTasksById(waitingOnUUID, YorosisContext.get().getTenantId(), YorosisConstants.YES)) {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			TaskboardTaskDependencies taskboardTaskDependencies = TaskboardTaskDependencies.builder().waitingOn(taskboardTask).activeFlag(YorosisConstants.YES)
					.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
					.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).taskboardTask(task).build();
			taskDependencies.add(taskboardTaskDependencies);
			waitingOnList.add(taskboardTask.getTaskId());
		}
		List<TaskboardTaskDependencies> taskDependenciesList = taskboardTaskDependenciesRepository.saveAll(taskDependencies);
		taskboardActivityLogService.saveDependencyActivity(task.getTaskboard(), task, waitingOnList, "addedWaitingOn");
		taskDependenciesList.stream().forEach(d -> waitingOn.add(constructEntityToVO(d.getWaitingOn(), d)));
		return waitingOn;
	}

	private List<TaskboardTaskVO> saveBlockingDependencies(TaskDependenciesVO taskDependenciesVO, TaskboardTask task) throws JsonProcessingException {
		List<TaskboardTaskDependencies> taskDependencies = new ArrayList<>();
		List<UUID> blockingUUID = new ArrayList<>();
		List<TaskboardTaskVO> blocking = new ArrayList<>();
		List<String> blockingOnList = new ArrayList<>();
		taskDependenciesVO.getBlocking().stream().forEach(d -> blockingUUID.add(d.getId()));
		for (TaskboardTask taskboardTask : taskboardTaskRepository.getTasksById(blockingUUID, YorosisContext.get().getTenantId(), YorosisConstants.YES)) {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			TaskboardTaskDependencies taskboardTaskDependencies = TaskboardTaskDependencies.builder().blocking(taskboardTask).activeFlag(YorosisConstants.YES)
					.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
					.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).taskboardTask(task).build();
			taskDependencies.add(taskboardTaskDependencies);
			blockingOnList.add(taskboardTask.getTaskId());
		}
		List<TaskboardTaskDependencies> taskDependenciesList = taskboardTaskDependenciesRepository.saveAll(taskDependencies);
		taskboardActivityLogService.saveDependencyActivity(task.getTaskboard(), task, blockingOnList, "addedBlocking");
		taskDependenciesList.stream().forEach(d -> blocking.add(constructEntityToVO(d.getBlocking(), d)));
		return blocking;
	}

	private List<TaskboardTaskVO> saveRelatedTasksDependencies(TaskDependenciesVO taskDependenciesVO, TaskboardTask task) throws JsonProcessingException {
		List<TaskboardTaskDependencies> taskDependencies = new ArrayList<>();
		List<UUID> relatedTasksUUID = new ArrayList<>();
		List<TaskboardTaskVO> relatedTask = new ArrayList<>();
		List<String> relatedOnList = new ArrayList<>();
		taskDependenciesVO.getRelatedTasks().stream().forEach(d -> relatedTasksUUID.add(d.getId()));
		for (TaskboardTask taskboardTask : taskboardTaskRepository.getTasksById(relatedTasksUUID, YorosisContext.get().getTenantId(), YorosisConstants.YES)) {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			TaskboardTaskDependencies taskboardTaskDependencies = TaskboardTaskDependencies.builder().relatedTask(taskboardTask)
					.activeFlag(YorosisConstants.YES).tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
					.createdOn(timestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).taskboardTask(task).build();
			taskDependencies.add(taskboardTaskDependencies);
			relatedOnList.add(taskboardTask.getTaskId());
		}
		List<TaskboardTaskDependencies> taskDependenciesList = taskboardTaskDependenciesRepository.saveAll(taskDependencies);
		taskboardActivityLogService.saveDependencyActivity(task.getTaskboard(), task, relatedOnList, "addedRelatedTask");
		taskDependenciesList.stream().forEach(d -> relatedTask.add(constructEntityToVO(d.getRelatedTask(), d)));
		return relatedTask;
	}

	private TaskboardTaskVO constructEntityToVO(TaskboardTask task, TaskboardTaskDependencies taskDependencies) {
		return TaskboardTaskVO.builder().id(task.getId()).taskId(task.getTaskId()).dependencyId(taskDependencies.getId()).taskName(task.getTaskName()).build();
	}

	public TaskDependenciesVO getTaskDependencies(UUID taskId) {
		List<TaskboardTaskVO> waitingOn = new ArrayList<>();
		List<TaskboardTaskVO> blocking = new ArrayList<>();
		List<TaskboardTaskVO> relatedTasks = new ArrayList<>();
		List<TaskboardTaskDependencies> taskDependencies = taskboardTaskDependenciesRepository.getDependenciesByTaskId(taskId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskDependencies != null && !taskDependencies.isEmpty()) {
			for (TaskboardTaskDependencies taskDependency : taskDependencies) {
				if (taskDependency.getWaitingOn() != null) {
					waitingOn.add(constructEntityToVO(taskDependency.getWaitingOn(), taskDependency));
				} else if (taskDependency.getBlocking() != null) {
					blocking.add(constructEntityToVO(taskDependency.getBlocking(), taskDependency));
				} else if (taskDependency.getRelatedTask() != null) {
					blocking.add(constructEntityToVO(taskDependency.getRelatedTask(), taskDependency));
				}
			}
		}
		return TaskDependenciesVO.builder().waitingOn(waitingOn).blocking(blocking).relatedTasks(relatedTasks).build();
	}
}