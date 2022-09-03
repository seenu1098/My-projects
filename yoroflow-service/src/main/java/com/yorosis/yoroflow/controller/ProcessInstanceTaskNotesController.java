package com.yorosis.yoroflow.controller;

import java.util.List;
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
import com.yorosis.yoroflow.models.ProcessInstanceTaskNotesVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.services.ProcessInstanceTaskNotesService;

@RestController
@RequestMapping("/task-notes/v1/")
public class ProcessInstanceTaskNotesController {

	@Autowired
	private ProcessInstanceTaskNotesService processInstanceTaskNotesService;

	@PostMapping("/create")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO createTaskProperty(@RequestBody List<ProcessInstanceTaskNotesVO> taskNotesVO) {
		return processInstanceTaskNotesService.saveAndUpdateTaskNotes(taskNotesVO);
	}

	@GetMapping(value = "/get-list/{instanceTaskId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<ProcessInstanceTaskNotesVO> getProcessDefinition(
			@PathVariable("instanceTaskId") String instanceTaskId) {
		return processInstanceTaskNotesService.getTaskInstanceNotes(UUID.fromString(instanceTaskId));
	}

	@GetMapping(value = "/get-list/send-back/{instanceTaskId}/{eventTaskId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public Set<ProcessInstanceTaskNotesVO> getTaskNOtesForSendBack(
			@PathVariable("instanceTaskId") String instanceTaskId, @PathVariable("eventTaskId") String eventTaskId) {
		return processInstanceTaskNotesService.getTaskInstanceNotesForSendBack(UUID.fromString(instanceTaskId),
				UUID.fromString(eventTaskId));
	}

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO saveTaskNotes(@RequestBody ProcessInstanceTaskNotesVO taskNotesVO) throws JsonProcessingException {
		return processInstanceTaskNotesService.saveTaskNote(taskNotesVO);
	}

	@GetMapping(value = "/get-notes/{instanceTaskId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<ProcessInstanceTaskNotesVO> getTaskNotes(@PathVariable("instanceTaskId") String instanceTaskId) {
		return processInstanceTaskNotesService.getTaskNotes(UUID.fromString(instanceTaskId));
	}
}
