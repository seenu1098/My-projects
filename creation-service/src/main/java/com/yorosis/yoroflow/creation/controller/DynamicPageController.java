package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.vo.PageFieldVO;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.service.DynamicPageService;

@RestController
@RequestMapping("/dynamic-page/v1/")
public class DynamicPageController {

	@Autowired
	private DynamicPageService dynamicPageService;

	@GetMapping(path = "/get/fields/for/page/{pageIdentifier}/{version}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public List<PageFieldVO> getFieldsForPage(@PathVariable(name = "pageIdentifier") String pageIdentifier,
			@PathVariable(name = "version") Long version) throws IOException, YoroappsException {
		return dynamicPageService.getFieldList(pageIdentifier, version);
	}

	@GetMapping(path = "/get/fields/for/page/sub-section/{pageIdentifier}/{version}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public Map<String, List<PageFieldVO>> getFieldListForSubSection(
			@PathVariable(name = "pageIdentifier") String pageIdentifier, @PathVariable(name = "version") Long version)
			throws IOException, YoroappsException {
		return dynamicPageService.getFieldListForSubSection(pageIdentifier, version);
	}

}
