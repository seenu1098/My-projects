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

import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.YoroGroupsUserVO;
import com.yorosis.yoroapps.vo.YoroGroupsVO;
import com.yorosis.yoroflow.rendering.service.YoroGroupService;
import com.yorosis.yoroflow.rendering.service.YoroGroupsUserService;

@RestController
@RequestMapping("/group/v1")
public class YoroGroupController {

	@Autowired
	private YoroGroupService groupService;

	@Autowired
	private YoroGroupsUserService yoroGroupsUserService;

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO saveGroups(@RequestBody YoroGroupsVO yoroGroupsVO) {
		return groupService.saveGroups(yoroGroupsVO);

	}

	@GetMapping("/get/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public YoroGroupsVO getYoroGroupsInfo(@PathVariable(name = "id") String id) {
		return groupService.getYoroGroupsInfo(UUID.fromString(id));

	}

	@GetMapping("/get/groups")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<YoroGroupsVO> getGroupList() {
		return yoroGroupsUserService.getYoroGroups();
	}
	
	@GetMapping("/get/all-groups")
	public List<YoroGroupsVO> getYoroGroupsWithOwner() {
		return yoroGroupsUserService.getYoroGroupsWithOwner();
	}

	@PostMapping("/save/yoro-groups-users")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO saveYoroGroupsUser(@RequestBody YoroGroupsUserVO yoroGroupsUserVO) {
		return yoroGroupsUserService.saveYoroGroupsUser(yoroGroupsUserVO);

	}
	
	@PostMapping("/save/yoro-groups-owners")
	public ResponseStringVO saveYoroGroupsOwner(@RequestBody YoroGroupsUserVO yoroGroupsUserVO) {
		return yoroGroupsUserService.saveOwners(yoroGroupsUserVO);

	}

	@GetMapping("/get/user-id/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<UUID> getUserIdList(@PathVariable(name = "id") UUID id) {
		return yoroGroupsUserService.getUserIdByGroup(id);
	}

	@GetMapping("/get/user-id")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<UUID> getAllUserIdList() {
		return yoroGroupsUserService.getAllUserId();
	}

	@GetMapping("/license/is-allowed")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public LicenseVO isAllowed() {
		return groupService.isAllowed();
	}

}
