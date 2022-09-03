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
import com.yorosis.yoroflow.services.GroupService;

@RestController
@RequestMapping("/user-management/v1")
public class UserManagementController {

	@Autowired
	private GroupService groupService;

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO saveAndUpdateGroup(@RequestBody GroupVO vo) {
		return groupService.saveAndUpdateGroup(vo);
	}

	@GetMapping("/get/{groupId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public GroupVO getGroup(@PathVariable("groupId") UUID groupId) {
		return groupService.getGroupInfo(groupId);
	}

	@GetMapping("/get/list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<GroupVO> getGroupsList() {
		return groupService.getGroupsList();
	}

}
