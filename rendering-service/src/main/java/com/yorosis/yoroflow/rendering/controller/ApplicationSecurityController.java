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
import com.yorosis.yoroflow.rendering.service.ApplicationSecurityService;

@RestController
@RequestMapping("/application-security/v1")
public class ApplicationSecurityController {

	@Autowired
	private ApplicationSecurityService applicationSecurityService;

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator','User','Guest'})")
	public ResponseStringVO savePagePermissions(@RequestBody SecurityVO securityVO) {
		return applicationSecurityService.saveApplicationSecurities(securityVO);
	}

	@GetMapping("/get/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator','User','Guest'})")
	public List<PermissionVO> getPagePermissions(@PathVariable(name = "id") String pageId) {
		return applicationSecurityService.getApplicationPermissionsList(UUID.fromString(pageId));
	}

}
