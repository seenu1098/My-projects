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

import com.yorosis.yoroflow.models.PermissionVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.SecurityVO;
import com.yorosis.yoroflow.services.ProcessDefinitionPermissionService;

@RestController
@RequestMapping("/permissions/v1/")
public class ProcessDefPrmsnController {
	@Autowired
	private ProcessDefinitionPermissionService processDefPrmsnService;

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO getTaskList(@RequestBody SecurityVO vo) {
		return processDefPrmsnService.saveWorkflowSecurities(vo);
	}

	@GetMapping("/get/{processDefinitionId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<PermissionVO> getTaskList(@PathVariable("processDefinitionId") String processDefinitionId) {
		return processDefPrmsnService.getWorkflowPermissionsList(UUID.fromString(processDefinitionId));
	}

}
