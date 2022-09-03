package com.yorosis.yoroflow.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.models.AttachmentsVo;
import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.services.AttachmentService;

@RestController
@RequestMapping("/attachments/v1/")
public class AttachmentsController {

	@Autowired
	private AttachmentService AttachmentService;

	@PostMapping("/get/list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public AttachmentsVo getList(@RequestBody PaginationVO paginationVO) throws IOException {
		return AttachmentService.getTaskboardAttachments(paginationVO);
	}

	@GetMapping("/get/board-names-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public AttachmentsVo getBoardNamesList() throws IOException {
		return AttachmentService.getBoardNames();
	}
}
