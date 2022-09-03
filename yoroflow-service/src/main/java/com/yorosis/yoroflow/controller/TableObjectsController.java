package com.yorosis.yoroflow.controller;

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

import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.TableObjectsColumnsVO;
import com.yorosis.yoroflow.models.TableObjectsVO;
import com.yorosis.yoroflow.services.TableObjectsService;

@RestController
@RequestMapping("/table/v1/")
public class TableObjectsController {

	@Autowired
	private TableObjectsService tableObjectService;

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO saveAndUpdateTableObjection(@RequestBody TableObjectsVO vo) {
		return tableObjectService.saveTableObjects(vo);
	}

	@GetMapping("/get/table-info/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public TableObjectsVO getTableObjectsById(@PathVariable(name = "id") String id) {
		return tableObjectService.getTableObjectInfoById(UUID.fromString(id));
	}

	@GetMapping("/get/table-info/by-name/{name}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public TableObjectsVO getTableObjectByName(@PathVariable(name = "name") String name) {
		return tableObjectService.getTableObjectUsingName(name);
	}

	@GetMapping("/get/table-names")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<TableObjectsVO> getTableNames() {
		return tableObjectService.getTableNames();
	}

	@GetMapping("/get/field-names/{tableObjectId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<TableObjectsColumnsVO> getTableColumnNames(@PathVariable(name = "tableObjectId") String tableObjectId) {
		return tableObjectService.getTableObjectColumns(UUID.fromString(tableObjectId));
	}

	@GetMapping("/check/table-name/{tableName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO checkTableName(@PathVariable(name = "tableName") String tableName) {
		return tableObjectService.checkTableName(tableName);

	}

}
