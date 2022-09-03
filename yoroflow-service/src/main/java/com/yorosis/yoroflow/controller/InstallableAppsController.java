package com.yorosis.yoroflow.controller;

import java.io.IOException;
import java.text.ParseException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.apps.vo.AppsVo;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.services.InstallableAppsService;

@RestController
@RequestMapping("/install-apps/v1")
public class InstallableAppsController {

	@Autowired
	private InstallableAppsService installableAppsService;

	@PostMapping("/install-app")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator'})")
	public ResponseStringVO saveInstallableApps(@RequestBody AppsVo appsVo) throws IOException, ParseException {
		return installableAppsService.saveInstallableApps(appsVo);
	}

}
