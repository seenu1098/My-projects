package com.yorosis.yoroflow.rendering.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.vo.ThemesVO;
import com.yorosis.yoroflow.rendering.service.ThemesService;

@RestController
@RequestMapping("/themes/v1/")
public class ThemeController {

	@Autowired
	private ThemesService themesService;

	@GetMapping("/get-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public List<ThemesVO> getThemesList() {
		return themesService.getThemesList();
	}
}
