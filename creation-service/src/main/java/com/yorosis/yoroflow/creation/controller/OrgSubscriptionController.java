package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.stripe.exception.StripeException;
import com.yorosis.yoroapps.vo.OrgSubscriptionVo;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SubscriptionExpireVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.service.OrgSubscriptionService;
import com.yorosis.yoroflow.creation.service.ProxyService;
import com.yorosis.yoroflow.creation.service.UserService;
import com.yorosis.yoroflow.creation.service.WorkflowClientService;
import com.yorosis.yoroflow.creation.service.YoroGroupService;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/org-sub/v1/")
public class OrgSubscriptionController {

	@Autowired
	private OrgSubscriptionService orgSubscriptionService;

	@Autowired
	private ProxyService proxyService;

	@Autowired
	private YoroGroupService yoroGroupService;

	@Autowired
	private UserService userService;

	@Autowired
	private WorkflowClientService workflowClientService;

	@PostMapping("save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Billing Administrator'})")
	public ResponseStringVO save(@RequestParam(value = "custom-attribute", required = false) String customAttribute)
			throws IOException {
		String currentTenantId = YorosisContext.get().getTenantId();
		ResponseStringVO response = null;
		try {
			YorosisContext.get().setTenantId("yoroflow");
			response = orgSubscriptionService.saveorgSubscription(customAttribute);
		} finally {
			YorosisContext.get().setTenantId(currentTenantId);
		}
		return response;
	}

	@GetMapping("/get/org-details")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public OrgSubscriptionVo getCustomerInfo() throws StripeException, JsonMappingException, JsonProcessingException {

		OrgSubscriptionVo orgSubscriptionVo = proxyService
				.getOrgSubscriptionByCustomer(YorosisContext.get().getTenantId());
		orgSubscriptionVo.setTeamsCount(yoroGroupService.getYoroTeamsCount().getCount());
		orgSubscriptionVo.setUsersCount(userService.getAllUsersCreatedByCustomer().getCount());
		orgSubscriptionVo
				.setWorkflowCount(workflowClientService.getWorkflowCount(YorosisContext.get().getToken()).getCount());
		orgSubscriptionVo
				.setTaskboardCount(workflowClientService.getTaskboardCount(YorosisContext.get().getToken()).getCount());
		return orgSubscriptionVo;
	}

	@PostMapping("/update")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Billing Administrator'})")
	public ResponseStringVO updateSubcription(@RequestBody OrgSubscriptionVo orgSubscriptionVo) {
//		Customers customer = customersRepository.findBySubdomainNameIgnoreCaseAndActiveFlagIgnoreCase(
//				orgSubscriptionVo.getSubdomainName(), YoroappsConstants.YES);
//		if (StringUtils.equalsIgnoreCase(customer.getTenantId(), YoroappsConstants.DEFAULT_SCHEMA)) {
//			return orgSubscriptionService.updateSubcription(orgSubscriptionVo);
//		} else {
		YorosisContext currentContext = YorosisContext.get();
		try {
			YorosisContext.clear();
			YorosisContext context = YorosisContext.builder().tenantId(YoroappsConstants.DEFAULT_SCHEMA)
					.userName(currentContext.getUserName()).build();
			YorosisContext.set(context);
			return orgSubscriptionService.saveorganizationSubscription(currentContext.getTenantId(), orgSubscriptionVo);
		} finally {
			YorosisContext.clear();
			YorosisContext.set(currentContext);
		}

//		}
	}

	@PostMapping("/set-free-plan")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Billing Administrator'})")
	public ResponseStringVO setFreePlan(@RequestBody SubscriptionExpireVO subscriptionExpireVO) throws IOException {
		return proxyService.setFreePlan(subscriptionExpireVO);
	}
}
