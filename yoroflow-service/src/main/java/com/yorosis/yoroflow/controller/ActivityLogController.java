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

import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.activity.ActivityLogVo;
import com.yorosis.yoroflow.services.ActivityLogService;
import com.yorosis.yoroflow.services.WorkflowActivityLogService;

@RestController
@RequestMapping("/activity-log/v1/")
public class ActivityLogController {

	@Autowired
	private ActivityLogService taskboardActivityLogService;

	@Autowired
	private WorkflowActivityLogService workflowActivityLogService;

	@PostMapping("get-taskboard-task/{taskId}/{taskboardId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ActivityLogVo getTaskList(@RequestBody PaginationVO vo, @PathVariable("taskId") String taskId,
			@PathVariable("taskboardId") String taskboardId) {
		return taskboardActivityLogService.getAllActivityList(vo, UUID.fromString(taskId),
				UUID.fromString(taskboardId));
	}

	@PostMapping("get-workflow/{instanceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ActivityLogVo getTaskForWorkflowList(@RequestBody PaginationVO vo,
			@PathVariable("instanceId") String instanceId) {
		return workflowActivityLogService.getAllActivityList(vo, UUID.fromString(instanceId));
	}

}
