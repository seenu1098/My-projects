package com.yorosis.yoroflow.controller;

import java.text.ParseException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.models.ErrorInstanceVO;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.services.DecisionTableTestService;
import com.yorosis.yoroflow.services.ErrorProcessService;

@RestController
@RequestMapping("/error/v1/")
public class ErrorProcessController {

	@Autowired
	private ErrorProcessService errorProcessService;

	@Autowired
	private DecisionTableTestService decisionTableTestService;

	@GetMapping("/get/{processInstanceId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<ErrorInstanceVO> getErrortask(@PathVariable("processInstanceId") String processInstanceId) {
		return errorProcessService.getErrortask(UUID.fromString(processInstanceId));

	}

	@GetMapping("/get/{processInstanceId}/{procDefId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public Boolean getDecisiontask(@PathVariable("processInstanceId") String processInstanceId,
			@PathVariable("procDefId") String procDefId) throws YoroFlowException, ParseException {
		return decisionTableTestService.processTypeSpecificService(UUID.fromString(processInstanceId),
				UUID.fromString(procDefId));

	}
}
