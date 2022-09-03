package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;
import java.util.UUID;

import javax.mail.MessagingException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.yorosis.yoroapps.vo.EmailTemplateVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.service.EmailService;
import com.yorosis.yoroflow.creation.service.EmailTemplateService;

@RestController
@RequestMapping("/email-template/v1/")
public class EmailTemplateController {
	@Autowired
	private EmailTemplateService emailTemplateService;
	@Autowired
	private EmailService emailService;

	@PostMapping("save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO save(@RequestBody EmailTemplateVO emailTemplateVO) throws IOException {
		return emailTemplateService.save(emailTemplateVO);
	}

	@GetMapping("/get/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public EmailTemplateVO getDetails(@PathVariable(name = "id") String id) {
		return emailTemplateService.getTemplateDetails(UUID.fromString(id));
	}

	@PostMapping("check")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO checkTemplateId(@RequestBody String templateId) {
		return emailTemplateService.checkTemplateId(templateId);
	}

	@PostMapping("send-mail")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User',"
			+ "'Guest','Taskboard User','Billing Administrator','User Administrator','Application Administrator'})")
	public ResponseStringVO sendmail(@RequestBody JsonNode emailJson)
			throws IOException, MessagingException, YoroappsException {
		return emailService.sendmail(emailJson);
	}

}
