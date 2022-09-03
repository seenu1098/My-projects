package com.yorosis.yoroflow.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.ProcessInstancePropertyVO;
import com.yorosis.yoroflow.models.ProcessInstanceRequest;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.TableData;
import com.yorosis.yoroflow.models.WorkflowTaskProgressVo;
import com.yorosis.yoroflow.services.ProcessInstanseTaskService;

@RestController
@RequestMapping("/board/v1")
public class ProcessInstanceTaskController {

	@Autowired
	private ProcessInstanseTaskService processInstanseTaskService;

	@PostMapping("/create/task")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO createProcessDefinition(@RequestBody ProcessInstanceRequest processInstanceRequest) {
		return processInstanseTaskService.addProcessInstanceTasks(processInstanceRequest);

	}

	@PostMapping("/create/task/files")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public void createProcessDefinition(@RequestParam("data") String data,
			@RequestParam("files") List<MultipartFile> file) {

	}

	@PostMapping("/get/process-instance-task/list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public TableData getList(@RequestBody PaginationVO paginationVO) throws IOException {
		return processInstanseTaskService.getProcessInstanceTaskList(paginationVO);
	}

	@GetMapping("/get/property-value/{processInstanceTaskId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ProcessInstancePropertyVO getTableColumnNames(
			@PathVariable(name = "processInstanceTaskId") String processInstanceTaskId) throws JsonProcessingException {
		return processInstanseTaskService.getPropertyValue(UUID.fromString(processInstanceTaskId));
	}

	@GetMapping("/progress/{processInstanceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public WorkflowTaskProgressVo getTaskProgress(
			@PathVariable(name = "processInstanceId") String processInstanceId) throws JsonProcessingException {
		return processInstanseTaskService.getProcessProgress(UUID.fromString(processInstanceId));
	}

}
