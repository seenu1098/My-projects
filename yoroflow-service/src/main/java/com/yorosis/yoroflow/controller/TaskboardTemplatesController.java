package com.yorosis.yoroflow.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.TaskboardTemplatesVO;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.services.TaskboardTemplateService;

@RestController
@RequestMapping("/taskboard-templates/v1/")
public class TaskboardTemplatesController {
	@Autowired
	private TaskboardTemplateService taskboardTemplateService;

	@GetMapping("get/templates")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<TaskboardTemplatesVO> getTaskboardTemplates() {
		YorosisContext context = YorosisContext.get();
		try {
			YorosisContext.set(YorosisContext.builder().tenantId(YorosisConstants.DEFAULT_SCHEMA).build());
			return taskboardTemplateService.getTaskboardTemplates();
		} finally {
			YorosisContext.clear();
			YorosisContext.set(context);
		}

	}

	@PostMapping("/save/template")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public ResponseStringVO saveTaskboardTemplates(@RequestBody TaskboardTemplatesVO vo) {
		return taskboardTemplateService.saveTaskboardTemplates(vo);
	}
}
