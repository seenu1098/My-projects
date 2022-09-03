package com.yorosis.yoroflow.controller;

import java.io.IOException;
import java.text.ParseException;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroapps.vo.LicenseVO;
import com.yorosis.yoroapps.vo.SubscriptionExpireVO;
import com.yorosis.yoroapps.vo.YorDocsNamesVo;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.docs.DocCommentListVo;
import com.yorosis.yoroflow.models.docs.DocsCommentVo;
import com.yorosis.yoroflow.models.docs.TeamSecurityTypeVo;
import com.yorosis.yoroflow.models.docs.YoroDocumentVO;
import com.yorosis.yoroflow.models.docs.YoroDocumentsVo;
import com.yorosis.yoroflow.models.docs.YoroSecurityDetailsVO;
import com.yorosis.yoroflow.services.docs.YoroDocsCommentService;
import com.yorosis.yoroflow.services.docs.YoroDocumentService;

@RestController
@RequestMapping("/yoro-docs/v1")
public class YoroDocumentsController {

	@Autowired
	private YoroDocumentService yoroDocumentService;

	@Autowired
	private YoroDocsCommentService yoroDocsCommentService;

	@Autowired
	private ObjectMapper mapper;

	@PostMapping(path = "/save/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','Taskboard User','User','Guest'})")
	public ResponseStringVO save(@RequestParam("data") String data,
			@RequestParam(value = "yoroDocs", required = false) MultipartFile file,
			@PathVariable("workspaceId") String workspaceId) throws IOException, ParseException {
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		YoroDocumentVO yoroDocumentVO = mapper.readValue(data, YoroDocumentVO.class);
		ResponseStringVO yoroResponse = yoroDocumentService.saveAndUpdateDocs(yoroDocumentVO, file,
				UUID.fromString(workspaceId));

		return yoroResponse;
	}

	@GetMapping("/get/all-docs/{workspaceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','Taskboard User','User','Guest'})")
	public List<YoroDocumentsVo> getYoroDocsList(@PathVariable("workspaceId") String workspaceId) throws IOException {
		return yoroDocumentService.getYoroDocsLists(UUID.fromString(workspaceId));
	}

	@GetMapping("/delete/{docId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','Taskboard User','User','Guest'})")
	public ResponseStringVO deleteDocument(@PathVariable("docId") String docId) throws IOException {
		return yoroDocumentService.deleteWorkspace(UUID.fromString(docId));
	}

	@GetMapping("/get/security/{docId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','Taskboard User','User','Guest'})")
	public YoroSecurityDetailsVO getYoroDocsSecurityList(@PathVariable("docId") String docId) throws IOException {
		return yoroDocumentService.getSecurity(UUID.fromString(docId));
	}

	@PostMapping("/save-security")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','Taskboard User','User','Guest'})")
	public ResponseStringVO saveSecurityYoroDocs(@RequestBody YoroSecurityDetailsVO yoroSecurityDetailsVO)
			throws IOException {
		return yoroDocumentService.saveSecurity(yoroSecurityDetailsVO);
	}

	@PostMapping("/save/team-security")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','Taskboard User','User','Guest'})")
	public ResponseStringVO saveTeamSecurity(@RequestBody TeamSecurityTypeVo teamSecurityTypeVo) throws IOException {
		return yoroDocumentService.saveTeamSecurity(teamSecurityTypeVo);
	}

	@GetMapping(value = "/download/docs/{docId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','Taskboard User','User','Guest'})")
	public ResponseEntity<byte[]> showFiles(@PathVariable("docId") UUID docId) throws IOException {
		byte[] document = yoroDocumentService.getFile(docId);
		HttpHeaders header = new HttpHeaders();
		header.setContentType(new MediaType("application", "png"));
		header.setContentLength(document.length);
		return new ResponseEntity<>(document, header, HttpStatus.OK);
	}

	@GetMapping("/name-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','Taskboard User','User','Guest'})")
	public List<YorDocsNamesVo> getYoroDocsNamesList() {
		return yoroDocumentService.getYoroDocsNamesList();
	}

	@GetMapping("/get/doc-comment/{docId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','Taskboard User','User','Guest'})")
	public DocCommentListVo getYoroDocsCommentsList(@PathVariable("docId") UUID docId) {
		return yoroDocsCommentService.getTaskCommentsById(docId);
	}

	@PostMapping("/save/doc-comment")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','Taskboard User','User','Guest'})")
	public ResponseStringVO saveYoroDocsComments(@RequestBody DocsCommentVo docsCommentVo) {
		return yoroDocsCommentService.saveOrUpdateDocsComment(docsCommentVo);
	}

	@GetMapping("/license/is-allowed")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','Taskboard User','User','Guest'})")
	public LicenseVO isAllowed() {
		return yoroDocumentService.isAllowed();
	}

	@GetMapping("/all-docs-name-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','Taskboard User','User','Guest'})")
	public List<YoroDocumentsVo> getYoroDocsNamesAndWorkspaceNamesList() {
		return yoroDocumentService.getYoroDocsNamesAndWorkspaceNamesList();
	}

	@PostMapping("/inactivate-docs")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','Taskboard User','User','Guest'})")
	public ResponseStringVO inactivateDocs(@RequestBody SubscriptionExpireVO subscriptionExpireVO) {
		return yoroDocumentService.inactivateDocs(subscriptionExpireVO);
	}
}
