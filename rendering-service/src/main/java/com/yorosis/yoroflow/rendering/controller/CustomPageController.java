package com.yorosis.yoroflow.rendering.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.vo.CustomPageVO;
import com.yorosis.yoroflow.rendering.service.CustomPageService;

@RestController
@RequestMapping("/custom-page/v1")
public class CustomPageController {

	@Autowired
	private CustomPageService customPageService;

	@GetMapping("/get-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<CustomPageVO> getRolesNames() {
		return customPageService.getCustomPageList();
	}

}
