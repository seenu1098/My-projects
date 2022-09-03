package com.yorosis.yoroflow.creation.controller;

import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.vo.CustomAttributeListVO;
import com.yorosis.yoroapps.vo.CustomAttributeVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.service.UserCustomAttributeService;

@RestController
@RequestMapping("/custom-attributes/v1")
public class UserCustomAttributesController {

	@Autowired
	private UserCustomAttributeService userCustomAttributeService;

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO saveCustomAttributes(@RequestBody CustomAttributeVO customAttributeVO) throws Exception {
		return userCustomAttributeService.saveCustomAttribute(customAttributeVO);
	}

	@GetMapping("/get")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public Set<CustomAttributeListVO> getCustomAttributes() {
		return userCustomAttributeService.getCustomAttributes();
	}
}
