package com.yorosis.yoroflow.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.TaskDependenciesVO;
import com.yorosis.yoroflow.services.TaskboardTaskDependenciesService;

@RestController
@RequestMapping("/task-dependency/v1/")
public class TaskboardTaskDependenciesController {
	@Autowired
	private TaskboardTaskDependenciesService taskboardTaskDependenciesService;

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public TaskDependenciesVO saveTaskDependenciesVO(@RequestBody TaskDependenciesVO taskDependenciesVO) throws JsonProcessingException {
		return taskboardTaskDependenciesService.saveTaskDependencies(taskDependenciesVO);
	}

	@GetMapping("/get/{taskId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public TaskDependenciesVO getTaskDependenciesVO(@PathVariable("taskId") String taskId) {
		return taskboardTaskDependenciesService.getTaskDependencies(UUID.fromString(taskId));
	}

	@GetMapping("/remove/{dependencyId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO removeDependency(@PathVariable("dependencyId") String dependencyId) {
		return taskboardTaskDependenciesService.removeTaskDepedency(UUID.fromString(dependencyId));
	}
}
