package com.yorosis.yoroflow.controller;

import java.io.IOException;
import java.util.Set;
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
import com.yorosis.yoroflow.models.AllTaskVO;
import com.yorosis.yoroflow.models.FieldListVO;
import com.yorosis.yoroflow.models.LaunchedListVO;
import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.ProcessInstanceUserTaskVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.RessignResponseTaskVO;
import com.yorosis.yoroflow.models.RessignTaskVO;
import com.yorosis.yoroflow.models.TableDataVO;
import com.yorosis.yoroflow.models.TaskBackgroundVo;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.services.TaskListService;

@RestController
@RequestMapping("/mytask/v1")
public class TaskListController {

	@Autowired
	private TaskListService taskListService;

	@Deprecated
	@PostMapping("/get-list/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public TableDataVO getTaskList(@RequestBody PaginationVO vo, @PathVariable("workspaceId") String workspaceId)
			throws JsonProcessingException {
		return taskListService.getTaskList(vo, UUID.fromString(workspaceId));
	}

	@PostMapping("/get-all-list/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public AllTaskVO getAllTaskList(@RequestBody PaginationVO vo, @PathVariable("workspaceId") String workspaceId) {
		return taskListService.getAllTaskList(vo, UUID.fromString(workspaceId));
	}

	@GetMapping("/get-list-count/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public TableDataVO getTaskListCount(@PathVariable("workspaceId") String workspaceId) {
		return taskListService.getTaskListCount(UUID.fromString(workspaceId));
	}

	@PostMapping("/get-launched-list/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public LaunchedListVO getLaunchedTaskList(@RequestBody PaginationVO vo,
			@PathVariable("workspaceId") String workspaceId) {
		return taskListService.getLaunchedTaskList(vo, UUID.fromString(workspaceId));
	}

	@GetMapping("/get-all-task-names/{workspaceId}/{allWorkspace}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public AllTaskVO getAllTaskNameList(@PathVariable("workspaceId") String workspaceId, @PathVariable("allWorkspace") Boolean allWorkspace) {
		return taskListService.getTaskNameWithCountList(UUID.fromString(workspaceId), allWorkspace);
	}
	
	@GetMapping("/get-all-task-names-count/{workspaceId}/{allWorkspace}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public AllTaskVO getAllTaskCountList(@PathVariable("workspaceId") String workspaceId, @PathVariable("allWorkspace") Boolean allWorkspace) {
		return taskListService.getOnlyTaskCounts(UUID.fromString(workspaceId), allWorkspace);
	}

	@GetMapping("/get/{processInstanceTaskId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ProcessInstanceUserTaskVO getTaskList(@PathVariable("processInstanceTaskId") String processInstanceTaskId) {
		return taskListService.getTask(UUID.fromString(processInstanceTaskId));
	}

	@PostMapping("/reassign-task")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public RessignResponseTaskVO reassignTask(@RequestBody RessignTaskVO ressignTaskVO) throws JsonProcessingException {
		return taskListService.reassignTask(ressignTaskVO);
	}

	@PostMapping("/set-assign-task")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO setAssignedTo(@RequestBody RessignTaskVO ressignTaskVO) throws YoroFlowException {
		return taskListService.setAssignedTo(ressignTaskVO);
	}

	@PostMapping("/filter-task-list/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public Set<FieldListVO> getFilterValuesList(@RequestBody PaginationVO vo,
			@PathVariable("workspaceId") String workspaceId) {
		return taskListService.getFilterValues(vo, UUID.fromString(workspaceId));
	}

	@GetMapping("/get-task-background")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public TaskBackgroundVo getTaskBackgroundInfo() {
		return taskListService.getTaskBackground();
	}

	@PostMapping("/wild-search/get-list/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public TableDataVO getTaskListForWildCard(@RequestBody PaginationVO vo,
			@PathVariable("workspaceId") String workspaceId) throws JsonProcessingException {
		return taskListService.getListBasedOnWildCardSearch(vo, UUID.fromString(workspaceId));
	}

	@PostMapping("/get/process-instance-task/running-process/list/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public TableDataVO getRunningProcessList(@RequestBody PaginationVO paginationVO,
			@PathVariable("workspaceId") String workspaceId) throws IOException {
		return taskListService.getProcessInstanceTaskListForRunningProcess(paginationVO, UUID.fromString(workspaceId));
	}

	@PostMapping("/get/process-instance-task/completed-process/list/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public TableDataVO getCompletedProcessList(@RequestBody PaginationVO paginationVO,
			@PathVariable("workspaceId") String workspaceId) throws IOException {
		return taskListService.getProcessInstanceTaskListForCompletedProcess(paginationVO,
				UUID.fromString(workspaceId));
	}
}
