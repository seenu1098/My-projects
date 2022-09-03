package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;
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

import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SubscriptionExpireVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroapps.vo.YoroGroupsVO;
import com.yorosis.yoroflow.creation.service.YoroGroupService;

@RestController
@RequestMapping("/group/v1")
public class YoroGroupController {

	@Autowired
	private YoroGroupService groupService;

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO saveGroups(@RequestBody YoroGroupsVO yoroGroupsVO) {
		return groupService.saveGroups(yoroGroupsVO);

	}

	@GetMapping("/get/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public YoroGroupsVO getYoroGroupsInfo(@PathVariable(name = "id") String id) {
		return groupService.getYoroGroupsInfo(UUID.fromString(id));

	}

	@GetMapping("/license/is-allowed")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public LicenseVO isAllowed() {
		return groupService.isAllowed();
	}

	@GetMapping("/get/teams-count")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO getTeamsCount() {
		return groupService.getYoroTeamsCount();

	}

	@PostMapping("/inactivate-teams")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Billing Administrator'})")
	public ResponseStringVO inactivateTeams(@RequestBody SubscriptionExpireVO subscriptionExpireVO) throws IOException {
		return groupService.inactivateTeams(subscriptionExpireVO);
	}

	@GetMapping("/get/groups")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<YoroGroupsVO> getGroupList() {
		return groupService.getYoroGroups();
	}
	
	@PostMapping("/get/groups")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User'})")
	public List<UsersVO> getSelectedTeamsUsers(@RequestBody ResponseStringVO response) {
		return groupService.getSelectedTeamsUsers(response.getGroupNameList());
	}

}
