package com.yorosis.yoroflow.rendering.controller;

import java.io.IOException;
import java.text.ParseException;
import java.util.List;
import java.util.UUID;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.yorosis.yoroapps.vo.DBDataVO;
import com.yorosis.yoroapps.vo.OptionsVO;
import com.yorosis.yoroapps.vo.PageDataVO;
import com.yorosis.yoroapps.vo.PageFieldVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SelectOptionVO;
import com.yorosis.yoroapps.vo.YoroResponse;
import com.yorosis.yoroflow.rendering.exception.YoroappsException;
import com.yorosis.yoroflow.rendering.service.DynamicPageService;
import com.yorosis.yoroflow.rendering.service.ProvisioningService;
import com.yorosis.yoroflow.rendering.service.vo.FilesVO;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/dynamic-page/v1/")
@Slf4j
public class DynamicPageController {

	@Autowired
	private DynamicPageService dynamicPageService;

	@Autowired
	private ProvisioningService provisioningService;

	@PostMapping(path = "/save/{workspaceId}", produces = "application/json", consumes = "application/json")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public YoroResponse save(@RequestBody String body,
			@RequestParam(value = "files", required = false) List<MultipartFile> file,
			@PathVariable("workspaceId") String workspaceId) throws YoroappsException, IOException, ParseException {
		long start = System.currentTimeMillis();
		JSONObject request = new JSONObject(body);
		YoroResponse yoroResponse = dynamicPageService.save(request, file, UUID.fromString(workspaceId));
		log.warn("Total save time for rendering service is: {} milliseconds", (System.currentTimeMillis() - start));

		return yoroResponse;
	}

	@GetMapping(path = "/save-page/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public YoroResponse save(@RequestParam("json") String page, @PathVariable("workspaceId") String workspaceId)
			throws IOException, ParseException, YoroappsException {
		JSONObject request = new JSONObject(page);
		return dynamicPageService.save(request, null, UUID.fromString(workspaceId));
	}

	@PostMapping(path = "/save/page/files/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public YoroResponse savePageAndFiles(@RequestParam("jsonData") String body,
			@RequestParam(value = "files", required = false) List<MultipartFile> file,
			@PathVariable("workspaceId") String workspaceId) throws YoroappsException, IOException, ParseException {
		JSONObject request = new JSONObject(body);
		return dynamicPageService.save(request, file, UUID.fromString(workspaceId));
	}

	@PostMapping(path = "/delete/page/data")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public YoroResponse deleteData(@RequestParam("jsonData") String body)
			throws YoroappsException, IOException, ParseException {
		JSONObject request = new JSONObject(body);
		return dynamicPageService.deleteData(request);
	}

	@GetMapping(path = "/provision/{tenantId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public void provisionNewCustomer(@PathVariable(name = "tenantId", required = true) String tenantId)
			throws IOException {
		provisioningService.provisionNewCustomer(tenantId);
	}

	@GetMapping(path = "/get/page/{pageIdentifier}/data/{dataId}/{version}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public PageDataVO getPageDataById(@PathVariable(name = "pageIdentifier") String pageIdentifier,
			@PathVariable(name = "dataId") String dataId, @PathVariable(name = "version") Long version)
			throws IOException, ParseException {
		return dynamicPageService.getData(pageIdentifier, UUID.fromString(dataId), version);
	}

	@GetMapping(path = "/get/page/{pageIdentifier}/field/{fieldName}/{fieldValue}/{version}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public PageDataVO getPageDataByFieldId(@PathVariable(name = "pageIdentifier") String pageIdentifier,
			@PathVariable(name = "fieldName") String fieldName, @PathVariable(name = "fieldValue") Object fieldValue,
			@PathVariable(name = "version") Long version) throws IOException, ParseException {
		return dynamicPageService.getDataForField(pageIdentifier, fieldName, fieldValue, version);
	}

	@GetMapping(path = "/get/fields/for/page/{pageIdentifier}/{version}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public List<PageFieldVO> getFieldsForPage(@PathVariable(name = "pageIdentifier") String pageIdentifier,
			@PathVariable(name = "version") Long version) throws IOException {
		return dynamicPageService.getFieldList(pageIdentifier, version);
	}

	// select - multi-select - radio button - auto-complete (match or not matched)
	@GetMapping(path = "/get/list/values/{pageIdentifier}/{controlName}/{version}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public List<OptionsVO> getListValues(@PathVariable(name = "pageIdentifier") String pageIdentifier,
			@PathVariable(name = "controlName") String controlName, @PathVariable(name = "version") Long version)
			throws ParseException, IOException {
		return dynamicPageService.getListValues(pageIdentifier, controlName, version);
	}

	@PostMapping(path = "/get/list/filter/value")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public List<OptionsVO> getListByFilterValue(@RequestBody SelectOptionVO selectOptionVo) throws ParseException {
		return dynamicPageService.getDynamicSelectBoxValuesByFilterValue(selectOptionVo);
	}

	@PostMapping(path = "/get/auto-complete-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public List<OptionsVO> getAutoCompleteList(@RequestBody DBDataVO vo) throws ParseException {
		return dynamicPageService.getDynamicAutoCompleteList(vo);
	}

	@PostMapping(path = "/upload-file")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public ResponseStringVO attachFile(@RequestParam("name") String name,
			@RequestParam(value = "files[]", required = false) MultipartFile file) throws IOException, YoroappsException {
		return dynamicPageService.saveAttachments(name, file);
	}

	@PostMapping(path = "/app/upload-file")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public ResponseStringVO attachFileFromApp(@RequestParam("name") String name,
			@RequestParam(value = "files", required = false) MultipartFile file) throws IOException, YoroappsException {
		return dynamicPageService.saveAttachments(name, file);
	}

	@GetMapping(value = "/download/file/{filepath}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public ResponseEntity<byte[]> showFiles(@PathVariable("filepath") String filepath) throws IOException {
		byte[] document = dynamicPageService.getFile(filepath);
		HttpHeaders header = new HttpHeaders();
		header.setContentType(new MediaType("application", "png"));
		header.setContentLength(document.length);
		return new ResponseEntity<>(document, header, HttpStatus.OK);
	}

	@PostMapping(value = "/delete/file")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public ResponseStringVO deleteFiles(@RequestBody List<FilesVO> vo) throws IOException {
		return dynamicPageService.deleteFile(vo);
	}

}
