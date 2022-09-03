package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.table.service.TableObjectsSecurityService;
import com.yorosis.yoroflow.creation.table.vo.TableSecurityVOList;

@RestController
@RequestMapping("/table-security/v1/")
public class TableObjectsSecurityController {

	@Autowired
	private TableObjectsSecurityService tableObjectsSecurityService;

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO saveDataTableSecurity(@RequestBody TableSecurityVOList vo) {
		return tableObjectsSecurityService.saveDataTableSecurity(vo);
	}
	
	@PostMapping("/save-owner")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO saveOrUpdateOwnerSecurity(@RequestBody TableSecurityVOList vo) {
		return tableObjectsSecurityService.saveOrUpdateOwnerSecurity(vo);
	}
	
	@PostMapping("/save-team")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO saveOrUpdateTeamSecurity(@RequestBody TableSecurityVOList vo) {
		return tableObjectsSecurityService.saveOrUpdateTeamSecurity(vo);
	}

	@GetMapping("/get-security/{tableId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public TableSecurityVOList getTableVOList(@PathVariable(name = "tableId") String tableId) throws IOException {
		return tableObjectsSecurityService.getDataTableSecurity(UUID.fromString(tableId));
	}
}
