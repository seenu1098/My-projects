package com.yorosis.yoroflow.rendering.controller;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroapps.vo.ApplicationVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.rendering.exception.YoroappsException;
import com.yorosis.yoroflow.rendering.service.ApplicationService;
import com.yorosis.yoroflow.rendering.service.vo.ApplicationDetailsVO;
import com.yorosis.yoroflow.rendering.service.vo.ApplicationListVO;

@RestController
@RequestMapping("/application/v1/")
public class ApplicationController {

	@Autowired
	private ApplicationService applicationService;

	private final ObjectMapper mapper = new ObjectMapper();

	@GetMapping("/get/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ApplicationVO getApplication(@PathVariable(name = "id") String applicationId)
			throws YoroappsException, IOException {
		return applicationService.getApplicationInfo(applicationId);
	}

	@GetMapping("/check-subdomain-name/{applicationId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator','User','Guest'})")
	public ResponseStringVO checkSubdomainName(@PathVariable(name = "applicationId") String applicationId) {
		return applicationService.checkSubdomainName(applicationId);
	}

	@PostMapping("/save/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator','User','Guest'})")
	public ResponseStringVO saveApplication(@RequestParam("data") String data,
			@RequestParam(value = "file", required = false) MultipartFile file,
			@PathVariable("workspaceId") String workspaceId) throws IOException {
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		ApplicationVO applicationVO = mapper.readValue(data, ApplicationVO.class);
		return applicationService.saveApplication(applicationVO, file, UUID.fromString(workspaceId));
	}

	@GetMapping("/check-application-name/{name}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator','User','Guest'})")
	public ResponseStringVO checkApplicationName(@PathVariable(name = "name") String applicationName) {
		return applicationService.checkApplicationName(applicationName);
	}

	@GetMapping("/get-list/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator','User','Guest'})")
	public List<ApplicationVO> getApplicationsList(@PathVariable("workspaceId") String workspaceId) throws IOException {
		return applicationService.getApplicationsList(UUID.fromString(workspaceId));
	}

	@PostMapping("/get-permission-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator','User','Guest'})")
	public List<ApplicationVO> getApplicationsPermissionList(@RequestBody ApplicationListVO applicationListVO)
			throws IOException {
		return applicationService.checkPermission(applicationListVO);
	}

	@PostMapping("/get/logo")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator','User','Guest'})")
	public List<ApplicationDetailsVO> getLogoForApplication(@RequestBody ApplicationListVO applicationIdListVO)
			throws IOException {
		return applicationService.getApplicationLogo(applicationIdListVO);
	}

	@DeleteMapping("/delete/{applicationName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator','User','Guest'})")
	public ResponseStringVO deleteApplication(@PathVariable(name = "applicationName") String applicationName) {
		return applicationService.deleteApplicationInfo(applicationName);
	}

	@GetMapping("/get/application-count/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator','User','Guest'})")
	public ResponseStringVO getApplicationCount(@PathVariable("workspaceId") String workspaceId) {
		return applicationService.checkApplicationCount(UUID.fromString(workspaceId));
	}
}
