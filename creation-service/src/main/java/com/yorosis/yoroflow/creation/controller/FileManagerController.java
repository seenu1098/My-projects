package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroapps.vo.ExcelFileManagerVO;
import com.yorosis.yoroflow.creation.service.FileManagerService;

@RestController
@RequestMapping("/file-manager/v1/")
public class FileManagerController {

	@Autowired
	private FileManagerService fileManagerService;

	@PostMapping(path = "upload", produces = "application/json", consumes = "application/json")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public void uploadFileForExcel(@RequestBody ExcelFileManagerVO excelFileManagerVO) throws IOException {
		fileManagerService.uploadFileForExcel(excelFileManagerVO.getKey(), excelFileManagerVO.getInputStream());
	}

}
