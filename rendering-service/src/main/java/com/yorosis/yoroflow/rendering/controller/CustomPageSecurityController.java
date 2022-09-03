package com.yorosis.yoroflow.rendering.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.vo.PermissionVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SecurityVO;
import com.yorosis.yoroflow.rendering.service.CustomPageSecurityService;

@RestController
@RequestMapping("/custom-page-security/v1")
public class CustomPageSecurityController {

	@Autowired
	private CustomPageSecurityService pageSecurityService;

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO savePagePermissions(@RequestBody SecurityVO securityVO) {
		return pageSecurityService.savePageSecurities(securityVO);
	}

	@GetMapping("/get/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<PermissionVO> getPagePermissions(@PathVariable(name = "id") String pageId) {
		return pageSecurityService.getPagePermissionsList(UUID.fromString(pageId));
	}

}
