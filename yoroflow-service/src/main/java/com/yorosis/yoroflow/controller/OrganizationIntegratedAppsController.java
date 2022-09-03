package com.yorosis.yoroflow.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.general.exception.YorosisException;
import com.yorosis.yoroflow.models.OrganizationIntegratedAppsVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.services.OrganizationIntegratedAppsService;
import com.yorosis.yoroflow.services.ProxyYoroflowSchemaService;

@RestController
@RequestMapping("/org-apps/v1")
public class OrganizationIntegratedAppsController {
	@Autowired
	private OrganizationIntegratedAppsService organizationIntegratedAppsService;

	@Autowired
	private ProxyYoroflowSchemaService proxyYoroflowSchemaService;

	@PutMapping("/save/{authorizationCode}/{selectedAppId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<OrganizationIntegratedAppsVO> enableAppForOrganization(
			@PathVariable("authorizationCode") final String authorizationCode,
			@PathVariable("selectedAppId") final UUID selectedAppId) throws YorosisException {

		return organizationIntegratedAppsService.saveAppIntegration(authorizationCode, selectedAppId);
	}

	@GetMapping("/get/apps")
	public List<OrganizationIntegratedAppsVO> getApps() {
		return organizationIntegratedAppsService.getApplications();
	}

	@GetMapping("/remove/application/{appId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO removeApplication(@PathVariable("appId") String appId) {
		return organizationIntegratedAppsService.removeApplication(UUID.fromString(appId));
	}

	@GetMapping("/get/oauth-url")
	public ResponseStringVO getOauthUrl() {
		return proxyYoroflowSchemaService.getOauthUrl();
	}
}
