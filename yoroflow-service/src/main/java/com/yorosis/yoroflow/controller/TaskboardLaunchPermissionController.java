package com.yorosis.yoroflow.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.TaskboardVO;
import com.yorosis.yoroflow.models.taskboard.LaunchPermissionVo;
import com.yorosis.yoroflow.models.taskboard.LaunchTaskboardTaskVo;
import com.yorosis.yoroflow.services.TaskboardLaunchPermissionService;

@RestController
@RequestMapping("/taskboard-launch/v1")
public class TaskboardLaunchPermissionController {

	@Autowired
	private TaskboardLaunchPermissionService taskboardLaunchPermissionService;

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User',"
			+ "'Taskboard User','Workflow User'})")
	public ResponseStringVO saveAndUpdateTaskboardLaunchPermission(@RequestBody LaunchPermissionVo launchPermissionVo) {
		return taskboardLaunchPermissionService.saveAndUpdateTaskboardLaunchPermission(launchPermissionVo);
	}

	@GetMapping("/get-permission/list/{taskboardId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User',"
			+ "'Taskboard User','Workflow User'})")
	public LaunchPermissionVo getTaskboardLaunchPermission(@PathVariable("taskboardId") String taskboardId) {
		return taskboardLaunchPermissionService.getTaskboardLaunchPermission(UUID.fromString(taskboardId));
	}

	@GetMapping("/get-taskboard/list/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User',"
			+ "'Taskboard User','Workflow User'})")
	public List<TaskboardVO> getTaskboardListByLaunchPermission(@PathVariable("workspaceId") String workspaceId) {
		return taskboardLaunchPermissionService.getTaskboardByLaunch(workspaceId);
	}

	@PostMapping("/get-taskboard-task/list/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User',"
			+ "'Taskboard User','Workflow User'})")
	public LaunchTaskboardTaskVo getTaskboardTaskListByLaunchPermission(@RequestBody PaginationVO vo,
			@PathVariable("workspaceId") String workspaceId) {
		return taskboardLaunchPermissionService.getTaskboardTaskListByLaunch(vo, UUID.fromString(workspaceId));
	}

}
