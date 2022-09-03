package com.yorosis.taskboard.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.taskboard.models.TaskboardApplicationVO;
import com.yorosis.taskboard.services.TaskboardApplicationService;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.general.exception.YorosisException;

@RestController
@RequestMapping("/app-config/v1")
public class TaskboardAppConfigurationController {
	@Autowired
	private TaskboardApplicationService appConfigurationService;

	@PostMapping("/save")
	public ResponseStringVO saveAppConfiguration(@RequestBody TaskboardApplicationVO appConfigurationVO) {
		return appConfigurationService.saveAppConfiguration(appConfigurationVO);
	}

	@PutMapping("/save/{authorizationCode}/{selectedAppId}/{tenantId}/{taskboardId}")
	public List<TaskboardApplicationVO> saveTaskboardAppConfiguration(
			@PathVariable("authorizationCode") final String authorizationCode,
			@PathVariable("selectedAppId") final UUID selectedAppId, @PathVariable("tenantId") final String tenantId,
			@PathVariable("taskboardId") final String taskboardId) throws YorosisException {
		return appConfigurationService.saveTaskboardAppIntegration(authorizationCode, selectedAppId, tenantId,
				UUID.fromString(taskboardId));
	}

	@GetMapping("/get/config-apps/{taskboardId}")
	public List<TaskboardApplicationVO> getConfiguredApps(@PathVariable(name = "taskboardId") String taskboardId) {
		return appConfigurationService.getTaskboardApplications(UUID.fromString(taskboardId));
	}

	@GetMapping("/get/taskboard-apps/{applicationName}")
	public ResponseStringVO getConfiguredAppsByAplicationName(
			@PathVariable(name = "applicationName") String applicationName) {
		return appConfigurationService.getConfiguredAppsByAplicationName(applicationName);
	}
}
