package com.yorosis.yoroflow.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.services.UserCustomAttributeService;

@RestController
@RequestMapping("/org-custom-attribute/v1/")
public class OrgCustomAttributeController {

	@Autowired
	private UserCustomAttributeService userCustomAttributeService;

	@GetMapping("check")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO checkCustomAttributes() {
		return userCustomAttributeService.checkCustomAttributes();
	}

}
