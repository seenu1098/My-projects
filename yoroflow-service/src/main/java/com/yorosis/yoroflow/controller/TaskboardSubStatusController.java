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

import com.yorosis.yoroflow.models.SubStatusVO;
import com.yorosis.yoroflow.models.TaskboardSubStatusVO;
import com.yorosis.yoroflow.services.TaskboardSubStatusService;

@RestController
@RequestMapping("/sub-status/v1")
public class TaskboardSubStatusController {
	@Autowired
	private TaskboardSubStatusService taskboardSubStatusService;

	@PostMapping("/save/sub-status")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<SubStatusVO> saveSubStatus(@RequestBody TaskboardSubStatusVO taskboardSubStatusVO) {
		return taskboardSubStatusService.saveSubStatus(taskboardSubStatusVO);
	}

	@GetMapping("/get/sub-status/{taskboardColumnId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<SubStatusVO> getSubStatus(@PathVariable(name = "taskboardColumnId") String taskboardColumnId) {
		return taskboardSubStatusService.getSubStatusList(UUID.fromString(taskboardColumnId));
	}
}
