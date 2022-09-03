package com.yorosis.yoroflow.controller;

import java.io.IOException;
import java.text.ParseException;
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
import com.yorosis.yoroflow.models.TableData;
import com.yorosis.yoroflow.models.WorkflowDashboardVO;
import com.yorosis.yoroflow.services.ProcessInstanceService;

@RestController
@RequestMapping("/process-instance/v1/")
public class ProcessInstanceController {
	@Autowired
	private ProcessInstanceService processInstanceService;

	@PostMapping("/get/list/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public TableData getList(@RequestBody PaginationVO paginationVO, @PathVariable("workspaceId") String workspaceId)
			throws IOException {
		return processInstanceService.getProcessInsatanceList(paginationVO, UUID.fromString(workspaceId));
	}

	@GetMapping("/get/workflow-dashboard/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public WorkflowDashboardVO getWorkflowProcessList(@PathVariable("workspaceId") String workspaceId)
			throws ParseException {
		return processInstanceService.getWorkflowProcessList(UUID.fromString(workspaceId));
	}
}
