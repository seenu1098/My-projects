package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroapps.vo.ApplicationVO;
import com.yorosis.yoroapps.vo.PageFieldVO;
import com.yorosis.yoroapps.vo.PageVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.ShoppingCartImageVo;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.service.FileManagerService;
import com.yorosis.yoroflow.creation.service.PageService;

@RestController
@RequestMapping("/page/v1")
public class PageController {

	@Autowired
	private PageService pageService;

	@Autowired
	private FileManagerService fileManagerService;

	@PostMapping("/save/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public ResponseStringVO savePage(@RequestBody PageVO pageVO, @PathVariable("workspaceId") String workspaceId)
			throws Exception {
		return pageService.savePage(pageVO, UUID.fromString(workspaceId), false);
	}

	@GetMapping("/save-page/{page}/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public ResponseStringVO savePageByPageId(@PathVariable(name = "page") String page,
			@PathVariable("workspaceId") String workspaceId) throws IOException, YoroappsException {
		ObjectMapper mapper = new ObjectMapper();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

		PageVO pageVO = mapper.readValue(mapper.writeValueAsString(page), PageVO.class);
		return pageService.savePage(pageVO, UUID.fromString(workspaceId), false);
	}

	@PostMapping("/check-page-name")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public ResponseStringVO checkPageName(@RequestBody String pageName) {
		return pageService.checkPageName(pageName);
	}

	@GetMapping("/get/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public PageVO getPageDetails(@PathVariable(name = "id") UUID id) throws IOException {
		return pageService.getPageDetails(id);
	}

	@GetMapping("/get-page/{pageId}/{version}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public PageVO getPageDetailsByPageId(@PathVariable(name = "pageId") String id,
			@PathVariable(name = "version") Long version) throws IOException {
		return pageService.getPageDetailsByPageIdentifier(id, version);
	}

	@GetMapping("/get/page-names")
	public List<PageVO> getPageNamesList() throws IOException {
		return pageService.getPageNames();
	}

	@GetMapping("/get/logged-in/page-names/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public List<PageVO> getPageNameByLoggedInUser(@PathVariable("workspaceId") String workspaceId) throws IOException {
		return pageService.getPageNameForLoggedInUser(UUID.fromString(workspaceId));
	}

	@GetMapping("/get/workflowform/page-names/{layoutType}/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public List<PageVO> getWorkflowFormPageNamesInfo(@PathVariable(name = "layoutType") String layoutType,
			@PathVariable("workspaceId") String workspaceId) {
		return pageService.getWorkflowFormPageNames(layoutType, UUID.fromString(workspaceId));
	}

	@GetMapping("get/page-version/{pageId}/{layoutType}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public List<PageVO> getPageVersionInfo(@PathVariable(name = "pageId") String pageId,
			@PathVariable(name = "layoutType") String layoutType) {
		return pageService.getPageVersion(pageId, layoutType);
	}

	@PutMapping("/update/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public ResponseStringVO updatePage(@RequestBody PageVO pageVO, @PathVariable("id") UUID id) throws Exception {
		return pageService.updatePage(pageVO, id);
	}

	@GetMapping("/get/page-name/{pageName}/{isPublicForm}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public List<PageVO> getPageName(@PathVariable(name = "pageName") String pageName,
			@PathVariable(name = "isPublicForm") String isPublicForm) throws IOException {
		return pageService.getPageName(pageName, isPublicForm);
	}

	@GetMapping("/get/page-field-list/{pageId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public List<PageFieldVO> getPageFieldList(@PathVariable(name = "pageId") String pageId)
			throws IOException, YoroappsException {
		return pageService.getFieldList(pageId);
	}

	@GetMapping("/get/page-name/app-id/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public List<PageVO> getPageNameByApplicationId(@PathVariable(name = "id") UUID id) {
		return pageService.getPageNamesByApplicationId(id);
	}

	@GetMapping("/publish/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public ResponseStringVO publishPage(@PathVariable(name = "id") UUID id) {
		return pageService.publishPage(id);
	}

	@GetMapping("/get/page-name/prefix/{pageName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public List<PageVO> getPageNameWithPrefix(@PathVariable(name = "pageName") String pageName) throws IOException {
		return pageService.getPageNameWithPrefix(pageName);
	}

	@GetMapping("/get/app-prefix/{pageId}/{version}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public ApplicationVO getAppPrefix(@PathVariable(name = "pageId") String pageId,
			@PathVariable(name = "version") Long version) throws IOException {
		return pageService.getAppPrefix(pageId, version);
	}

	@GetMapping("/get/pageNames/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public List<PageVO> getPageNames(@PathVariable("workspaceId") String workspaceId) {
		return pageService.getPageNamesForImport(UUID.fromString(workspaceId));
	}

	@PostMapping("/save/import/pages/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public ResponseStringVO savePages(@RequestBody List<PageVO> pageVO, @PathVariable("workspaceId") String workspaceId)
			throws YoroappsException, IOException {
		return pageService.savePages(pageVO, UUID.fromString(workspaceId));
	}

	@PostMapping("/save/shopping-cart/image")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public ShoppingCartImageVo saveShoppingCartImage(@RequestBody ShoppingCartImageVo imageVo)
			throws YoroappsException, IOException {
		return pageService.saveShoppingCartImage(imageVo);
	}

	@GetMapping(path = "/get/shopping-cart/{key}", produces = "application/pdf")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator',"
			+ "'Application Administrator','Taskboard User','Workflow User','User','Guest'})")
	public ResponseEntity<byte[]> getImageByKey(@PathVariable("key") String key) throws IOException {
		byte[] document = fileManagerService.downloadFile(key);
		String type = "pdf";
		HttpHeaders header = new HttpHeaders();
		header.setContentType(new MediaType("application", type));
		header.setContentLength(document.length);
		return new ResponseEntity<>(document, header, HttpStatus.OK);
	}
}
