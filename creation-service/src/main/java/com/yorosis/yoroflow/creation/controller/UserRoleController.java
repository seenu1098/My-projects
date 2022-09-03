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

import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.RolesListVO;
import com.yorosis.yoroapps.vo.UserRolesVo;
import com.yorosis.yoroflow.creation.service.UserRoleService;

@RestController
@RequestMapping("/user-role/v1")
public class UserRoleController {

	@Autowired
	private UserRoleService userRoleService;

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO saveRoleUser(@RequestBody UserRolesVo userRolesVo) {
		return userRoleService.updateRoles(userRolesVo);
	}

	@GetMapping("/get-roles")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<RolesListVO> getRolesList() {
		return userRoleService.getRolesList();
	}

	@GetMapping("/get-user-roles/{roleId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public UserRolesVo getRolesList(@PathVariable String roleId) {
		return userRoleService.getAssociateUserRolesList(UUID.fromString(roleId));
	}

}
