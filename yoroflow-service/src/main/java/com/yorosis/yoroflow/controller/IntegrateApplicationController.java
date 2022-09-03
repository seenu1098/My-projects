package com.yorosis.yoroflow.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.models.AppIntegrationVO;
import com.yorosis.yoroflow.services.ProxyYoroflowSchemaService;

@RestController
@RequestMapping("/app-integrate/v1")
public class IntegrateApplicationController {
	@Autowired
	private ProxyYoroflowSchemaService proxyYoroflowService;

	@GetMapping("/get/apps")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<AppIntegrationVO> getAllApplications() {
		return proxyYoroflowService.getAllApplications();
	}
}
