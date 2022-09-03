package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;
import java.text.ParseException;
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

import com.yorosis.yoroapps.grid.vo.GridVO;
import com.yorosis.yoroapps.grid.vo.HeadersVO;
import com.yorosis.yoroapps.grid.vo.PaginationVO;
import com.yorosis.yoroapps.grid.vo.TableData;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.grid.service.GridCommonService;
import com.yorosis.yoroflow.creation.grid.service.GridDataService;
import com.yorosis.yoroflow.creation.grid.service.GridService;

@RestController
@RequestMapping("/grids/v1")
public class GridsController {

	@Autowired
	private GridDataService gridDataService;

	@Autowired
	private GridService gridsService;

	@Autowired
	private GridCommonService commonService;

	@GetMapping("/get-headers/{name}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public HeadersVO getHeader(@PathVariable(name = "name") String gridName) {
		return commonService.getGridHeaders(gridName);
	}

	@PostMapping("/get-grid-data/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public TableData getGridDataWithPagination(@RequestBody PaginationVO paginationInfo,
			@PathVariable(name = "workspaceId") String workspaceId)
			throws YoroappsException, ParseException, IOException {
		return gridDataService.getGridData(paginationInfo, UUID.fromString(workspaceId));
	}

	@GetMapping("/get/grid-name/{gridName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public List<GridVO> getGridName(@PathVariable(name = "gridName") String gridName) {
		return gridsService.getGridName(gridName);
	}
}
