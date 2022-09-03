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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.yorosis.yoroapps.vo.CustomPageVO;
import com.yorosis.yoroapps.vo.PageFieldVO;
import com.yorosis.yoroapps.vo.PageVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.service.CustomPageService;

@RestController
@RequestMapping("/custom-page/v1/")
public class CustomPageController {

	@Autowired
	private CustomPageService customPageService;

	@PostMapping("save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO save(@RequestBody CustomPageVO customPageVO) throws IOException {
		return customPageService.save(customPageVO);
	}

	@GetMapping("/get/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public CustomPageVO getDetails(@PathVariable(name = "id") String id) {
		return customPageService.getCustomPageDetails(UUID.fromString(id));
	}

	@GetMapping("/get-page-name-list/{pageName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<PageVO> getCustomPageNameList(@PathVariable(name = "pageName") String pageName)
			throws JsonProcessingException {
		return customPageService.getCustomPageNameList(pageName);
	}

	@GetMapping("/get-page-field-list/{pageIdentifier}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<PageFieldVO> getFieldList(@PathVariable(name = "pageIdentifier") String pageIdentifier)
			throws JsonProcessingException {
		return customPageService.getFieldList(pageIdentifier);
	}

}
