package com.yorosis.yoroflow.rendering.controller;

import java.text.ParseException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.grid.vo.HeadersVO;
import com.yorosis.yoroapps.grid.vo.PaginationVO;
import com.yorosis.yoroapps.grid.vo.TableData;
import com.yorosis.yoroflow.rendering.exception.YoroappsException;
import com.yorosis.yoroflow.rendering.grid.service.GridCommonService;
import com.yorosis.yoroflow.rendering.grid.service.GridDataService;

@RestController
@RequestMapping("/grids/v1")
public class GridsController {

	@Autowired
	private GridDataService gridDataService;

	@Autowired
	private GridCommonService commonService;

	@GetMapping("/get-headers/{name}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public HeadersVO getHeader(@PathVariable(name = "name") String gridName) {
		return commonService.getGridHeaders(gridName);
	}

	@PostMapping("/get-grid-data")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public TableData getGridDataWithPagination(@RequestBody PaginationVO paginationInfo)
			throws YoroappsException, ParseException {
		return gridDataService.getGridData(paginationInfo);
	}
}
