package com.yorosis.yoroflow.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.models.WorkflowTemplatesVO;
import com.yorosis.yoroflow.services.ProxyYoroflowSchemaService;

@RestController
@RequestMapping("/workflow-templates/v1")
public class WorkflowTemplatesController {
	@Autowired
	private ProxyYoroflowSchemaService proxyYoroflowSchemaService;

	@GetMapping("/get/templates")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<WorkflowTemplatesVO> getWorkflowTemplates() {
		return proxyYoroflowSchemaService.getWorkflowTemplates();
	}
}
