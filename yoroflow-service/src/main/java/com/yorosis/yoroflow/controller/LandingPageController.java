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

import com.yorosis.yoroflow.models.GroupVO;
import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.landingpage.LandingPageCountVO;
import com.yorosis.yoroflow.models.landingpage.LandingPageGraphVo;
import com.yorosis.yoroflow.models.landingpage.LatestWorkflowVO;
import com.yorosis.yoroflow.models.landingpage.TaskBoardFilterDataVo;
import com.yorosis.yoroflow.models.landingpage.TaskboardTaskVo;
import com.yorosis.yoroflow.models.landingpage.WorkflowTaskVO;
import com.yorosis.yoroflow.services.LandingPageService;

@RestController
@RequestMapping("/landing-page/v1")
public class LandingPageController {

	@Autowired
	private LandingPageService landingPageService;

	@GetMapping("/get-count/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public LandingPageCountVO getCount(@PathVariable("workspaceId") String workspaceId) {
		return landingPageService.getLandingPageCount(UUID.fromString(workspaceId));
	}

	@GetMapping("/get-count/{filter}/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public LandingPageGraphVo getCountByFilter(@PathVariable("filter") String filter,
			@PathVariable("workspaceId") String workspaceId) {
		return landingPageService.getGraphData(filter, UUID.fromString(workspaceId));
	}

	@PostMapping("/get-taskboard-task/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public TaskboardTaskVo getTaskBordTaskByFilter(@RequestBody PaginationVO vo,
			@PathVariable("workspaceId") String workspaceId) {
		return landingPageService.getDataForTaskBoardTask(vo, UUID.fromString(workspaceId));
	}

	@PostMapping("/get-done-taskboard-task")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public TaskboardTaskVo getDoneTaskBordTaskByFilter(@RequestBody PaginationVO vo) {
		return landingPageService.getDoneTaskboardTask(vo);
	}

	@PostMapping("/get-done-sub-status-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public TaskBoardFilterDataVo getSubStatusListForDoneColumn(@RequestBody PaginationVO vo) {
		return landingPageService.getSubStatusListForDoneColumn(vo);
	}

	@PostMapping("/get-workflow-task/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public WorkflowTaskVO getWorkflowTaskByFilter(@RequestBody PaginationVO vo,
			@PathVariable("workspaceId") String workspaceId) {
		return landingPageService.getWorkflowData(vo, UUID.fromString(workspaceId));
	}

	@GetMapping("/get-workflow/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public List<LatestWorkflowVO> getWorkflow(@PathVariable("workspaceId") String workspaceId) {
		return landingPageService.getLastLaunchWorkflow(UUID.fromString(workspaceId));
	}

	@GetMapping("/get-taskboard-names/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public TaskBoardFilterDataVo getBoardNameList(@PathVariable("workspaceId") String workspaceId) {
		return landingPageService.getBoardNameList(UUID.fromString(workspaceId));
	}

	@GetMapping("/get-workflow-groups")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public List<GroupVO> getUserGroupVo() {
		return landingPageService.getUserGroupVo();
	}
}
