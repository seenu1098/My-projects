package com.yorosis.yoroflow.creation.controller;

import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.grid.vo.GridVO;
import com.yorosis.yoroapps.vo.FieldVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.grid.service.GridsConfigurationService;

@RestController
@RequestMapping("/grids-config/v1")
public class GridsConfigurationController {

	@Autowired
	private GridsConfigurationService gridService;

	@PostMapping("/save-update")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO saveAndUpdateGrid(@RequestBody GridVO gridVO) {
		return gridService.saveAndUpdateGridData(gridVO);
	}

	@GetMapping("/get/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public GridVO getGridInfo(@PathVariable(name = "id") UUID id) {
		return gridService.getGridInfo(id);
	}

	@GetMapping("/get-by-grid-name/{gridName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public GridVO getGridInfoByGridName(@PathVariable(name = "gridName") String gridName) {
		return gridService.getGridInfoByGridName(gridName);
	}

	@GetMapping("/get/page/{pageId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public GridVO getGridInfoForPage(@PathVariable(name = "pageId") UUID pageId) {
		GridVO vo = gridService.getGridInfo(pageId);
		vo.setPageId(pageId);
		return vo;
	}

	@GetMapping("/check-grid/{gridName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO checkTableName(@PathVariable(name = "gridName") String gridName) {
		return gridService.checkGridName(gridName);

	}

	@GetMapping("/get/built-in/fields")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public Set<FieldVO> getBuildInFieldsForGrid() {
		return gridService.getBuitInFields();
	}
}
