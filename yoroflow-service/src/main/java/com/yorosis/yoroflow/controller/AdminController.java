package com.yorosis.yoroflow.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.models.EnvVariableRequestVO;
import com.yorosis.yoroflow.models.EnvVariableVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.SMSKeysVO;
import com.yorosis.yoroflow.services.AdminService;

@RestController
@RequestMapping("/env-variable/v1/")
public class AdminController {

	@Autowired
	private AdminService adminService;

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO saveEnvironmentVariable(@RequestBody EnvVariableVO envVariableVO) {
		return adminService.saveEnvironmentService(envVariableVO);
	}

	@GetMapping("/get/{processDefinitionKey}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<EnvVariableRequestVO> getEnvironmentVariable(
			@PathVariable(name = "processDefinitionKey") String processDefinitionKey) {
		return adminService.getEnvironmentVariables(processDefinitionKey);
	}

	@GetMapping("get/sms/{providerName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public SMSKeysVO getProviderDetails(@PathVariable(name = "providerName") String providerName) {
		return adminService.getProviderDetails(providerName);
	}

}
