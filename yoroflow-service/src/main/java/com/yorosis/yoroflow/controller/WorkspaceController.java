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

import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroapps.vo.WorkspaceDetailsVo;
import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.TaskBoardTaskSummaryVo;
import com.yorosis.yoroflow.models.WorkflowSummaryVO;
import com.yorosis.yoroflow.services.ProxyYoroflowSchemaService;
import com.yorosis.yoroflow.services.WorkspaceService;

@RestController
@RequestMapping("/workspace/v1")
public class WorkspaceController {

	@Autowired
	private WorkspaceService workspaceService;

	@Autowired
	private ProxyYoroflowSchemaService proxyService;

	@GetMapping("/name-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','Taskboard User','User','Guest'})")
	public WorkspaceDetailsVo getNamesListForWorkspace() {
		return workspaceService.getNamesListForWorkspace();
	}

	@GetMapping("/all/name-list/{tenantId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator'})")
	public WorkspaceDetailsVo getAllNamesListForWorkspace(@PathVariable(name = "tenantId") String tenantId) {
		return proxyService.getAllWorkspaceNameList(tenantId);
	}

	@PostMapping("/all/workflow-name-list/{workspaceId}/{subdomainName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator'})")
	public List<WorkflowSummaryVO> getAllWorkflowNamesListForWorkspace(@PathVariable("workspaceId") String workspaceId,
			@PathVariable("subdomainName") String subdomainName, @RequestBody PaginationVO vo) {
		return proxyService.getAllWorkflowNameList(UUID.fromString(workspaceId), vo, subdomainName);
	}

	@PostMapping("/all/taskboard-name-list/{workspaceId}/{subdomainName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator'})")
	public List<TaskBoardTaskSummaryVo> getAllTaskboardNamesListForWorkspace(
			@PathVariable("workspaceId") String workspaceId, @PathVariable("subdomainName") String subdomainName,
			@RequestBody PaginationVO vo) {
		return proxyService.getAllTaskboardNameList(UUID.fromString(workspaceId), vo, subdomainName);
	}
}
