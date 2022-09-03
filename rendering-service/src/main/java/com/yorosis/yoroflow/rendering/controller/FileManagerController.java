package com.yorosis.yoroflow.rendering.controller;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import com.yorosis.yoroapps.vo.ExcelFileManagerVO;
import com.yorosis.yoroapps.vo.GridImagesVO;
import com.yorosis.yoroapps.vo.ImageKeysVO;
import com.yorosis.yoroflow.rendering.service.FileManagerService;

@RestController
@RequestMapping("/file-manager/v1/")
public class FileManagerController {
	@Autowired
	private FileManagerService fileManagerService;

	@PostMapping(path = "upload", produces = "application/json", consumes = "application/json")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public void uploadFile(@RequestBody ExcelFileManagerVO excelFileManagerVO) throws IOException {
		fileManagerService.uploadFile(excelFileManagerVO.getKey(),
				new ByteArrayInputStream(excelFileManagerVO.getInputStream()), excelFileManagerVO.getContentSize());
	}

	@GetMapping(path = "download/{key}", produces = "application/json", consumes = "application/json")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public ExcelFileManagerVO downloadFile(@PathVariable("key") String key) throws IOException {
		byte[] imageStream = fileManagerService.downloadFile(key);
		ExcelFileManagerVO excelFileManagerVO = ExcelFileManagerVO.builder().inputStream(imageStream).build();
		return excelFileManagerVO;
	}

	@PostMapping(path = "download/images", produces = "application/json", consumes = "application/json")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public List<GridImagesVO> downloadFilesForGridImage(@RequestBody ImageKeysVO ImageKeysVO) throws IOException {
		return fileManagerService.getGridImages(ImageKeysVO);
	}

	@GetMapping(path = "download/image/{key}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public GridImagesVO downloadFileFromKey(@PathVariable("key") String key) throws IOException {
		return fileManagerService.getImageFromKey(key);
	}

	@GetMapping(value = "/downloadfile/{key}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public ResponseEntity<StreamingResponseBody> downloadImageAsStream(HttpServletRequest request,
			@PathVariable("key") String key) {
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, "image/jpeg")
				.body(fileManagerService.downloadFileAsStream(key));
	}

	@GetMapping(path = "/download-image/{key}", produces = "application/pdf")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Application Administrator'})")
	public ResponseEntity<byte[]> getImageByKey(@PathVariable("key") String key) throws IOException {
		byte[] document = fileManagerService.downloadFile(key);
		String type = "pdf";

		HttpHeaders header = new HttpHeaders();
		header.setContentType(new MediaType("application", type));
		header.setContentLength(document.length);
		return new ResponseEntity<>(document, header, HttpStatus.OK);
	}
}
