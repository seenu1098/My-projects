package com.yorosis.yoroflow.creation.service;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.yorosis.yoroapps.apps.vo.AppsVo;
import com.yorosis.yoroapps.vo.AccountDetailsVO;
import com.yorosis.yoroapps.vo.ReactiveOrInactiveUsers;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SubscriptionExpireVO;
import com.yorosis.yoroapps.vo.TaskboardNamesVO;
import com.yorosis.yoroapps.vo.WorkflowNamesVO;
import com.yorosis.yoroapps.vo.WorkspaceDetailsVo;

@FeignClient(name = "workflowClient", url = "${workflow.base.url}")
public interface WorkflowClientService {
	@GetMapping(value = "/flow/v1/name-list", consumes = "application/json")
	public List<WorkflowNamesVO> getWorkflowNameList(@RequestHeader("Authorization") String authorizationToken);

	@GetMapping(value = "/taskboard/v1/name-list", consumes = "application/json")
	public List<TaskboardNamesVO> getTaskboardNameList(@RequestHeader("Authorization") String authorizationToken);

	@GetMapping(value = "/workspace/v1/name-list", consumes = "application/json")
	public WorkspaceDetailsVo getNamesListForWorkspace(@RequestHeader("Authorization") String authorizationToken);

	@GetMapping(value = "/workspace/v1/all/name-list/{tenantId}", consumes = "application/json")
	public WorkspaceDetailsVo getAllNamesListForWorkspace(@RequestHeader("Authorization") String authorizationToken,
			@PathVariable(name = "tenantId") String tenantId);

	@GetMapping(value = "/flow/v1/get-workflow-count", consumes = "application/json")
	public ResponseStringVO getWorkflowCount(@RequestHeader("Authorization") String authorizationToken);

	@GetMapping(value = "/taskboard/v1/get-taskboard-count", consumes = "application/json")
	public ResponseStringVO getTaskboardCount(@RequestHeader("Authorization") String authorizationToken);

	@PostMapping(value = "/flow/v1/install-app", consumes = "application/json")
	public ResponseStringVO saveWorkflowApp(@RequestHeader("Authorization") String authorizationToken,
			@RequestBody AppsVo appsVo);

	@PostMapping(value = "/install-apps/v1/install-app", consumes = "application/json")
	public ResponseStringVO saveInstallableApps(@RequestHeader("Authorization") String authorizationToken,
			@RequestBody AppsVo appsVo);

//	@PostMapping(value = "/taskboard/v1/install-app", consumes = "application/json")
	@RequestMapping(method = RequestMethod.POST, value = "/taskboard/v1/install-app", consumes = "application/json")
	public ResponseStringVO saveTaskboardApp(@RequestHeader("Authorization") String authorizationToken,
			@RequestBody AppsVo appsVo);

	@PostMapping(value = "/activate-user/v1/reactive-users", consumes = "application/json")
	public ResponseStringVO saveReactiveUsers(@RequestHeader("Authorization") String authorizationToken,
			@RequestBody ReactiveOrInactiveUsers reactiveOrInactiveUsers);

	@PostMapping(value = "/activate-user/v1/inactive-users", consumes = "application/json")
	public ResponseStringVO saveInactiveUsers(@RequestHeader("Authorization") String authorizationToken,
			@RequestBody ReactiveOrInactiveUsers reactiveOrInactiveUsers);

	@PostMapping(value = "/account/v1/public/send-email/save", consumes = "application/json")
	public ResponseStringVO saveAccountDetails(@RequestBody AccountDetailsVO accountDetailsVO);

	@PostMapping(value = "/flow/v1/inactivate-workflow", consumes = "application/json")
	public ResponseStringVO inactivateWorkflows(@RequestHeader("Authorization") String authorizationToken,
			@RequestBody SubscriptionExpireVO subscriptionExpireVO);

	@PostMapping(value = "/taskboard/v1/inactivate-taskboard", consumes = "application/json")
	public ResponseStringVO inactivateTaskboards(@RequestHeader("Authorization") String authorizationToken,
			@RequestBody SubscriptionExpireVO subscriptionExpireVO);

	@PostMapping(value = "/yoro-docs/v1/inactivate-docs", consumes = "application/json")
	public ResponseStringVO inactivateDocs(@RequestHeader("Authorization") String authorizationToken,
			@RequestBody SubscriptionExpireVO subscriptionExpireVO);

}
