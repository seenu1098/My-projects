package com.yorosis.yoroflow.creation.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.vo.InstallAppVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.service.InstallAppService;

@RestController
@RequestMapping("/installed-apps/v1/")
public class InstallAppController {
	@Autowired
	private InstallAppService installAppService;

	@GetMapping("/get/apps")
	public List<InstallAppVO> getInstalledApps() {
		return installAppService.getInstalledApps();
	}

	@PostMapping("/install/app")
	public ResponseStringVO saveApp(@RequestBody InstallAppVO installAppVO) {
		return installAppService.save(installAppVO);
	}
}
