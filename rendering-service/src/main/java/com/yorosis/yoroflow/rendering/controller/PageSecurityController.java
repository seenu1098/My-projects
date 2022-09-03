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

import com.yorosis.yoroapps.vo.PagePermissionVO;
import com.yorosis.yoroapps.vo.PermissionVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SecurityVO;
import com.yorosis.yoroapps.vo.YoroGroupsVO;
import com.yorosis.yoroflow.rendering.service.PageSecurityService;

@RestController
@RequestMapping("/page-security/v1")
public class PageSecurityController {

	@Autowired
	private PageSecurityService pageSecurityService;

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public ResponseStringVO savePagePermissions(@RequestBody SecurityVO securityVO) {
		return pageSecurityService.savePageSecurities(securityVO);
	}

	@GetMapping("/get/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public List<PermissionVO> getPagePermissions(@PathVariable(name = "id") String pageId) {
		return pageSecurityService.getPagePermissionsList(UUID.fromString(pageId));
	}

	@GetMapping("/get-yorogroup-names/{name}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public List<YoroGroupsVO> getYoroGroupNames(@PathVariable(name = "name") String groupName) {
		return pageSecurityService.getYoroGroupNames(groupName);
	}

	@PostMapping("/get-permission")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public ResponseStringVO getPermissionInfo(@RequestBody PagePermissionVO permission) {
		return pageSecurityService.getPagePermission(permission);
	}

	@PostMapping("/check/group-name")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public ResponseStringVO checkGroupName(@PathVariable(name = "name") String groupName) {
		return pageSecurityService.checkYoroGroupCreated(groupName);
	}

	@PostMapping("/save/permission-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public ResponseStringVO savePagePermissionsList(@RequestBody List<PermissionVO> pagePermissionsVO) {
		return pageSecurityService.savePermissionsList(pagePermissionsVO);
	}
}
