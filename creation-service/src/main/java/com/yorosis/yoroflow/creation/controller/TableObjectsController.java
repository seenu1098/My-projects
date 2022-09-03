package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;
import java.text.ParseException;
import java.util.List;
import java.util.UUID;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroapps.grid.vo.PaginationVO;
import com.yorosis.yoroapps.vo.PageVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.table.service.TableObjectsService;
import com.yorosis.yoroflow.creation.table.vo.DataTableListVo;
import com.yorosis.yoroflow.creation.table.vo.DataTableVO;
import com.yorosis.yoroflow.creation.table.vo.DeleteDataTableValuesVO;
import com.yorosis.yoroflow.creation.table.vo.ExcelVO;
import com.yorosis.yoroflow.creation.table.vo.MapVO;
import com.yorosis.yoroflow.creation.table.vo.TableListVO;
import com.yorosis.yoroflow.creation.table.vo.TableObjectsColumnsVO;
import com.yorosis.yoroflow.creation.table.vo.TableObjectsVO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/table/v1/")
public class TableObjectsController {

	@Autowired
	private TableObjectsService tableObjectService;

	@Autowired
	private ObjectMapper mapper;

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO saveAndUpdateTableObjection(@RequestBody TableObjectsVO vo) {
		return tableObjectService.saveTableObjects(vo);
	}

	@PostMapping("/save/table-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO saveTableList(@RequestBody List<TableObjectsVO> vo) {
		return tableObjectService.saveTableObjectsList(vo);
	}

	@PostMapping("/get-table-vo-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public List<TableObjectsVO> getTableVOList(@RequestBody TableListVO vo) {
		return tableObjectService.getTableObjectsListVO(vo);
	}

	@GetMapping("/get/table-info/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public TableObjectsVO getTableObjectsById(@PathVariable(name = "id") String id) throws IOException {
		return tableObjectService.getTableObjectInfoById(UUID.fromString(id));
	}

	@GetMapping("/get/table-info/by-name/{name}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public TableObjectsVO getTableObjectByName(@PathVariable(name = "name") String name) throws IOException {
		return tableObjectService.getTableObjectUsingName(name);
	}

	@GetMapping("/get/table-names")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public List<TableObjectsVO> getTableNames() throws IOException {
		return tableObjectService.getTableNames();
	}

	@GetMapping("/get/table-names/page")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public List<PageVO> getTableNamesForPage() {
		return tableObjectService.getTableNamesForPage();
	}

	@GetMapping("/get/field-names/{tableObjectId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public List<TableObjectsColumnsVO> getTableColumnNames(@PathVariable(name = "tableObjectId") String tableObjectId) {
		return tableObjectService.getTableObjectColumns(UUID.fromString(tableObjectId));
	}

	@GetMapping("/check/table-name/{tableName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO checkTableName(@PathVariable(name = "tableName") String tableName) {
		return tableObjectService.checkTableName(tableName);
	}

	@PostMapping("/save/table-data/{tableId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO saveDataTable(@RequestBody List<DataTableVO> vo,
			@PathVariable(name = "tableId") String tableId) throws ParseException, IOException {
		return tableObjectService.saveDataTable(vo, UUID.fromString(tableId));
	}

	@PostMapping("/get/table-data/{tableId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public DataTableListVo getDataTable(@RequestBody PaginationVO vo, @PathVariable(name = "tableId") String tableId)
			throws ParseException {
		return tableObjectService.getDataTableValues(vo, UUID.fromString(tableId));
	}

	@GetMapping("/delete-column/{columnId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO deleteColumn(@PathVariable(name = "columnId") String columnId) {
		return tableObjectService.deleteColumn(UUID.fromString(columnId));
	}

	@PostMapping("/save-update-column/{tableId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO createOrEditColumn(@RequestBody TableObjectsColumnsVO tableObjectsColumnsVO,
			@PathVariable(name = "tableId") String tableId) {
		return tableObjectService.createOrEditColumn(tableObjectsColumnsVO, UUID.fromString(tableId));
	}

	@GetMapping("/delete-table/{tableId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO deleteTable(@PathVariable(name = "tableId") String tableId) {
		return tableObjectService.deleteTable(UUID.fromString(tableId));
	}

	@PostMapping("/delete-table-data")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO deleteTableData(@RequestBody DeleteDataTableValuesVO deleteDataTableValuesVO)
			throws ParseException, IOException {
		return tableObjectService.deleteDataTableValues(deleteDataTableValuesVO);
	}

	@PostMapping("/import-table")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ResponseStringVO importTable(@RequestParam("data") String data,
			@RequestParam(value = "file", required = false) MultipartFile file)
			throws JsonMappingException, JsonProcessingException {
		log.info("data:{}", data);
		log.info("file:{}", file);
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		MapVO listOfMapVO = mapper.readValue(data, MapVO.class);

		return tableObjectService.importExcel(file, listOfMapVO);
	}

	@PostMapping("/get-excel-headers")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Application Administrator'})")
	public ExcelVO getExcelHeaders(@RequestParam(value = "file", required = false) MultipartFile file) {
		return tableObjectService.getExcelHeaders(file);
	}

	@GetMapping("/get-excel/{tableId}")
	@Transactional(readOnly = true)
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public void getExcelData(@PathVariable(name = "tableId") String tableId, HttpServletResponse response)
			throws YoroappsException, ParseException, IOException {
		tableObjectService.getExcel(UUID.fromString(tableId), response);
	}

}
