package com.yorosis.yoroflow.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.taskboard.LaunchTaskboardTaskVo;
import com.yorosis.yoroflow.services.RequestTaskService;

@RestController
@RequestMapping("/request/v1")
public class RequestTaskController {

	@Autowired
	private RequestTaskService requestTaskService;

	@PostMapping("/get/submitted-task/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public LaunchTaskboardTaskVo getTotalTaskReports(@RequestBody PaginationVO vo,
			@PathVariable("workspaceId") String workspaceId) {
		return requestTaskService.getMySubmittedTasksList(vo, UUID.fromString(workspaceId));
	}

}
