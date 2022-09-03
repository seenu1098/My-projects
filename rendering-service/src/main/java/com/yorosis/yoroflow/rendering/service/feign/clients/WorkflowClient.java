package com.yorosis.yoroflow.rendering.service.feign.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import com.fasterxml.jackson.databind.JsonNode;
import com.yorosis.yoroapps.vo.TaskDetailsResponse;
import com.yorosis.yoroflow.rendering.service.vo.WorkflowVo;

@FeignClient(name = "workflowClient", url = "${workflow.base.url}")
public interface WorkflowClient {
	@PostMapping(value = "/flow/v1/complete/step", consumes = "application/json")
	public TaskDetailsResponse completeWorkflowStep(@RequestHeader("Authorization") String authorizationToken,
			WorkflowVo vo);

	@PostMapping(value = "/flow/v1/start/workflow/{processDefinitionKey}/{workflowVersion}/{workspaceId}", consumes = "application/json")
	public TaskDetailsResponse startWorkflow(@RequestHeader("Authorization") String authorizationToken,
			@RequestParam("processDefinitionKey") String processDefinitionKey,
			@RequestParam("workflowVersion") Long workflowVersion, @PathVariable("workspaceId") String workspaceId, JsonNode request);

	@PostMapping(value = "/flow/v1/start/workflow/latest/{processDefinitionKey}/{workspaceId}", consumes = "application/json")
	public void startLatestWorkflow(@RequestHeader("Authorization") String authorizationToken,
			@RequestParam("processDefinitionKey") String processDefinitionKey, @PathVariable("workspaceId") String workspaceId, JsonNode request);

	@GetMapping(value = "/flow/v1/get/message/{processDefinitionKey}", consumes = "application/json")
	public String getMessageInfo(@RequestHeader("Authorization") String authorizationToken,
			@PathVariable("processDefinitionKey") String processDefinitionKey);
}