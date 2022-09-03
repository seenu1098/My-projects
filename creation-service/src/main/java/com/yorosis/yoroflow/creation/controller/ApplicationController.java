package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.vo.ApplicationVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.service.ApplicationService;

@RestController
@RequestMapping("/application/v1/")
public class ApplicationController {

	@Autowired
	private ApplicationService applicationService;

	@GetMapping("/get-list/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public List<ApplicationVO> getApplicationsList(@PathVariable("workspaceId") String workspaceId) throws IOException {
		return applicationService.getApplicationsList(UUID.fromString(workspaceId));
	}

	@GetMapping("/get-app-list/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public List<ApplicationVO> getApplicationList(@PathVariable("workspaceId") String workspaceId) throws IOException {
		return applicationService.getApplicationNameList(UUID.fromString(workspaceId));
	}

	@GetMapping("/check-app/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO checkApp(@PathVariable(name = "applicationId") String applicationId) {
		return applicationService.checkApplicationAlreadyExist(applicationId);
	}

}
