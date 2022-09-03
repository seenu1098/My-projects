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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.yorosis.yoroapps.vo.ExportPages;
import com.yorosis.yoroapps.vo.PageVO;
import com.yorosis.yoroflow.rendering.service.PageService;

@RestController
@RequestMapping("/page/v1")
public class PageController {

	@Autowired
	private PageService pageService;

	@GetMapping("/get-page/{pageId}/{version}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public PageVO getPageDetailsByPageId(@PathVariable(name = "pageId") String id,
			@PathVariable(name = "version") Long version) throws IOException {
		return pageService.getPageDetailsByPageIdentifier(id, version);
	}

	@PostMapping("/get/list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public List<PageVO> getPageList(@RequestBody List<ExportPages> exportPages)
			throws JsonMappingException, JsonProcessingException {
		return pageService.getPageList(exportPages);
	}
}
