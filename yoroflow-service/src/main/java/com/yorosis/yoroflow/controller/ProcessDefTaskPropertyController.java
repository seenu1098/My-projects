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

import com.yorosis.yoroflow.models.ProcessDefTaskPropertyVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.services.ProcessDefTaskPropertyService;

@RestController
@RequestMapping("/task-property/v1/")
public class ProcessDefTaskPropertyController {

	@Autowired
	private ProcessDefTaskPropertyService processDefTaskPropertyService;

	@PostMapping("/create")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO createTaskProperty(@RequestBody ProcessDefTaskPropertyVO propertyVO) {
		return processDefTaskPropertyService.saveTaskProperty(propertyVO);
	}

	@GetMapping(value = "/get/{processId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ProcessDefTaskPropertyVO getProcessDefinition(@PathVariable("processId") UUID processDefinitionId) {
		return processDefTaskPropertyService.getTaskPropertyInfo(processDefinitionId);
	}

}
