package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.entities.InstallableApps;
import com.yorosis.yoroapps.vo.InstallableAppsVo;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.service.InstallableAppsService;
import com.yorosis.yoroflow.creation.service.ProxyService;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@RestController
@RequestMapping("/install-apps/v1")
public class InstallableAppsController {

	@Autowired
	private InstallableAppsService installableAppsService;

	@Autowired
	private ProxyService proxyService;

	@GetMapping("/get-list")
	public List<InstallableAppsVo> getHeader() {
		return proxyService.getInstalledAppsList();
	}

	@GetMapping("/save/{workspaceId}/{appId}")
	public ResponseStringVO saveInstalleableApps(@PathVariable("workspaceId") String workspaceId,
			@PathVariable("appId") String appId) throws YoroappsException, IOException {
		InstallableApps installableApps = null;
		installableApps = proxyService.getInstallAppsById(UUID.fromString(appId));
		return installableAppsService.saveInstalleableApps(UUID.fromString(workspaceId), installableApps);
	}
}
