package com.yorosis.yoroflow.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.service.variables.SystemVariableService;

@RestController
@RequestMapping("/system-variables/v1")
public class SystemVariablesController {

	@Autowired
	private SystemVariableService systemVariableService;

	@GetMapping("/get")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<FieldVO> getVariables() {
		return systemVariableService.getFieldList();
	}

}
