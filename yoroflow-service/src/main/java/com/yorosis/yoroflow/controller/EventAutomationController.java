package com.yorosis.yoroflow.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.yorosis.yoroflow.models.EventAutomationCategoryVO;
import com.yorosis.yoroflow.models.EventAutomationConfigurationVO;
import com.yorosis.yoroflow.models.EventAutomationVO;
import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.services.EventAutomationService;
import com.yorosis.yoroflow.services.ProxyYoroflowSchemaService;

@RestController
@RequestMapping("/event-automation/v1/")
public class EventAutomationController {

	@Autowired
	private EventAutomationService eventAutomationService;

	@Autowired
	private ProxyYoroflowSchemaService proxyYoroflowService;

	@GetMapping("/get/automation-configurations/{taskboardId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<EventAutomationConfigurationVO> getAutomationConfigurationList(
			@PathVariable(name = "taskboardId") String taskboardId) {
		return proxyYoroflowService.getAutomationConfigurationList(UUID.fromString(taskboardId));
	}

	@PostMapping("/save/automation")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO saveAutomation(@RequestBody EventAutomationVO eventAutomationVO)
			throws JsonMappingException, JsonProcessingException {
		return eventAutomationService.saveAutomation(eventAutomationVO);
	}

	@GetMapping("/get/automation/{taskboardId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<EventAutomationVO> getAutomation(@PathVariable(name = "taskboardId") String taskboardId) {
		return eventAutomationService.getAutomationList(taskboardId);
	}

	@PostMapping("/set/rule-active")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO setRuleActive(@RequestBody EventAutomationVO eventAutomationVO) {
		return eventAutomationService.setRuleActive(eventAutomationVO);
	}

	@PostMapping("/delete-automation")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO deleteAutomation(@RequestBody EventAutomationVO eventAutomationVO) {
		return eventAutomationService.deleteAutomation(eventAutomationVO);
	}

	@GetMapping("/get/automation-categories/{taskboardId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<EventAutomationCategoryVO> getAutomationsByCategory(
			@PathVariable(name = "taskboardId") String taskboardId) {
		return proxyYoroflowService.getAutomationsByCategory(UUID.fromString(taskboardId));
	}

	@PostMapping("/save/automations")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO saveAllAutomations(@RequestBody List<EventAutomationVO> eventAutomationVO)
			throws JsonMappingException, JsonProcessingException {
		return eventAutomationService.saveAllAutomations(eventAutomationVO);
	}

	@GetMapping("/get/page-fields/{taskboardId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public Map<String, List<FieldVO>> getPageFields(@PathVariable(name = "taskboardId") String taskboardId) {
		return eventAutomationService.getPageFields(UUID.fromString(taskboardId));
	}

	@GetMapping(path = "/get/fields/for/page/sub-section/{pageIdentifier}/{version}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public Map<String, List<FieldVO>> getFieldListForSubSection(
			@PathVariable(name = "pageIdentifier") String pageIdentifier,
			@PathVariable(name = "version") Long version) {
		return eventAutomationService.getPageFieldVo(pageIdentifier, version);
	}
}
