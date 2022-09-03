package com.yorosis.yoroflow.rendering.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.grid.vo.SubDomainVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroflow.rendering.service.DomainService;
import com.yorosis.yoroflow.rendering.service.UserService;

@RestController
@RequestMapping("/user-service/v1")
public class UserController {

	@Autowired
	private UserService userService;

	@Autowired
	DomainService domainService;

	@GetMapping("/get/logged-in/user-details")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public UsersVO getUserDetails() throws IOException {
		return userService.getLoggedInUserDetails();
	}

	@GetMapping("/get/logged-in/user-profile-picture")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public UsersVO getLoggedInUserProfilePicture() throws IOException {
		return userService.getLoggedInUserProfilePicture();
	}

	@GetMapping("/get/list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<UsersVO> getUsersList() throws IOException {
		return userService.getAllUsers();
	}

	@GetMapping("/get/users/auto-complete/{name}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<UsersVO> getUsersAutoCompleteList(@PathVariable(name = "name") String userName) throws IOException {
		return userService.getUsersAutocomplete(userName);
	}

	@GetMapping("/get/sub-domain/{tenantId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public SubDomainVO getSubDomainInfo(@PathVariable(name = "tenantId") String tenantId) {
		return domainService.getSubDomain(tenantId);
	}

	@PostMapping("/save/theme")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO saveTheme(@RequestBody UsersVO userVO) {
		return userService.saveTheme(userVO);
	}
}
