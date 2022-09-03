package com.yorosis.yoroflow.controller;

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

import com.yorosis.yoroflow.models.GroupVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.UserGroupVO;
import com.yorosis.yoroflow.services.UserGroupService;

@RestController
@RequestMapping("/user-group/v1")
public class UserGroupController {

	@Autowired
	private UserGroupService userGroupService;

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO saveAndUpdate(@RequestBody UserGroupVO userGroupVO) {
		return userGroupService.saveAndUpdateUserGroup(userGroupVO);
	}

	@GetMapping("/get/user-groups")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<UserGroupVO> getUserGroupList() {
		return userGroupService.getUserGroupsVOList();
	}

	@GetMapping("/get/{userGroupId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public UserGroupVO getUserGroup(@PathVariable("userGroupId") UUID userGroupId) {
		return userGroupService.getUserGroup(userGroupId);
	}

	@GetMapping("/get/group-name/{groupName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<GroupVO> getUserGroup(@PathVariable("groupName") String groupName) {
		return userGroupService.getGroupNames(groupName);
	}
}
