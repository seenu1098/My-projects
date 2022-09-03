package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;
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
import com.yorosis.yoroapps.vo.OrgSummaryReportVo;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroapps.vo.WorkspaceSecurityVo;
import com.yorosis.yoroapps.vo.WorkspaceVO;
import com.yorosis.yoroflow.creation.service.ProxyService;
import com.yorosis.yoroflow.creation.service.WorkspaceService;

@RestController
@RequestMapping("/workspace/v1")
public class WorkspaceController {

	@Autowired
	private WorkspaceService workspaceService;

	@Autowired
	private ProxyService proxyService;

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO saveWorkspace(@RequestBody WorkspaceVO workspaceVO) {
		return workspaceService.saveAndUpdateWorkspace(workspaceVO);
	}
	
	@PostMapping("/save/workspace-avatar")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO saveWorkspaceAvatar(@RequestBody WorkspaceVO workspaceVO) {
		return workspaceService.saveWorkspaceAvatar(workspaceVO);
	}

	@GetMapping("/get/workspace")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<WorkspaceVO> getWorkspaceList() throws IOException {
		return workspaceService.getWorkspaceList();
	}

	@GetMapping("/get/org/summary/{subdomainName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator'})")
	public OrgSummaryReportVo getOrgUserTeamsList(@PathVariable(name = "subdomainName") String subdomainName)
			throws IOException {
		return proxyService.getOrgUserTeamsList(subdomainName);
	}

	@GetMapping("/get/all/workspace-list/{subdomainName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator'})")
	public List<WorkspaceVO> getAllWorkspaceList(@PathVariable(name = "subdomainName") String subdomainName)
			throws IOException {
		return proxyService.getAllWorkspaceList(subdomainName);
	}

	@GetMapping("/get/default/workspace")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public WorkspaceVO getDefaultWorkspace() throws IOException {
		return workspaceService.getDefaultWorkspace();
	}

	@GetMapping("/get-workspace/{workspaceKey}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public WorkspaceVO getWorkspaceByKey(@PathVariable(name = "workspaceKey") String workspaceKey) throws IOException {
		return workspaceService.getWorkspace(workspaceKey);
	}

	@GetMapping("/get/workspace/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public WorkspaceVO getWorkspaceById(@PathVariable(name = "id") String id) throws IOException {
		return workspaceService.getWorkspaceById(UUID.fromString(id));
	}

	@GetMapping(value = "/check/name/{workspaceName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO checkWorkflowAlreadyExistByName(@PathVariable("workspaceName") String workspaceName) {
		return workspaceService.checkWorkspaceByName(workspaceName);
	}

	@PostMapping("/workspace-security/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO saveWorkspaceSecurity(@RequestBody WorkspaceSecurityVo workspaceSecurityVo) {
		return workspaceService.getWorkspaceSecurityUpdate(workspaceSecurityVo);
	}

	@GetMapping("/default-workspace/save/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO saveDefault(@PathVariable(name = "id") String id) {
		return workspaceService.addDefaultWorkspace(UUID.fromString(id));
	}

	@GetMapping("/delete-workspace/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO deleteWorkspace(@PathVariable(name = "id") String id) {
		return workspaceService.deleteWorkspace(UUID.fromString(id));
	}

	@GetMapping("/archive-workspace/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO archiveWorkspace(@PathVariable(name = "id") String id) {
		return workspaceService.archiveWorkspace(UUID.fromString(id));
	}

	@GetMapping("/get-workspace-unique/{workspaceKey}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public WorkspaceVO getWorkspaceByUniqueKey(@PathVariable(name = "workspaceKey") String workspaceKey)
			throws IOException {
		return workspaceService.getWorkspaceByUniqueId(workspaceKey);
	}

	@GetMapping(value = "/check/unique-name/{workspaceUniqueId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO checkWorkflowUniqueAlreadyExistByName(
			@PathVariable("workspaceUniqueId") String workspaceUniqueId) throws IOException {
		return workspaceService.checkWorkspaceByUniqueId(workspaceUniqueId);
	}

	@GetMapping("/license/is-allowed")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public LicenseVO isAllowed() {
		return workspaceService.isAllowed();
	}

	@GetMapping("/get/all/workspace-name-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<WorkspaceVO> getAllWorkspaceList() {
		return workspaceService.getWorkspaceNamesList();
	}
	
	@GetMapping("/get/workspace-users/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User'})")
	public List<UsersVO> getWorkspaceUsers(@PathVariable (name="workspaceId") String workspaceId) throws IOException {
		return workspaceService.getWorkspaceUsers(UUID.fromString(workspaceId));
	}

}
