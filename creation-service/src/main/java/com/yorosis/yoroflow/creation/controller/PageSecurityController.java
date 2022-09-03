package com.yorosis.yoroflow.creation.controller;

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

import com.yorosis.yoroapps.vo.PageIdListVO;
import com.yorosis.yoroapps.vo.PermissionVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SecurityVO;
import com.yorosis.yoroapps.vo.YoroGroupsVO;
import com.yorosis.yoroflow.creation.service.PageSecurityService;

@RestController
@RequestMapping("/page-security/v1")
public class PageSecurityController {

	@Autowired
	private PageSecurityService pageSecurityService;

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO savePagePermissions(@RequestBody SecurityVO securityVO) {
		return pageSecurityService.savePageSecurities(securityVO);
	}

	@GetMapping("/get/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public List<PermissionVO> getPagePermissions(@PathVariable(name = "id") String pageId) {
		return pageSecurityService.getPagePermissionsList(UUID.fromString(pageId));
	}

	@GetMapping("/get-yorogroup-names/{name}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public List<YoroGroupsVO> getYoroGroupNames(@PathVariable(name = "name") String groupName) {
		return pageSecurityService.getYoroGroupNames(groupName);
	}

	@GetMapping("/check-group-exist/{name}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO checkGroupName(@PathVariable(name = "name") String groupName) {
		return pageSecurityService.checkYoroGroupCreated(groupName);
	}

	@PostMapping("/get/permission")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public List<PermissionVO> getPagePermissionList(@RequestBody PageIdListVO uuidList) {
		return pageSecurityService.getPagePermissionForImport(uuidList);
	}

	@PostMapping("/save/permission")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO savePermissions(@RequestBody List<PermissionVO> pagePermissionsVO) {
		return pageSecurityService.savePermissions(pagePermissionsVO);
	}

	@PostMapping("/save/permission/import")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO savePermissionsForImport(@RequestBody List<PermissionVO> pagePermissionsVO) {
		return pageSecurityService.savePermissionsForImport(pagePermissionsVO);
	}
}
