package com.yorosis.yoroflow.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.models.appwidgets.BarChartVO;
import com.yorosis.yoroflow.services.TaskboardSprintReportService;

@RestController
@RequestMapping("/sprint-report/v1/")
public class TaskboardSprintReportController {
	@Autowired
	private TaskboardSprintReportService sprintReportService;

	@GetMapping("/get-sprint-report/{sprintId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Taskboard User'})")
	public BarChartVO deleteSprintSettings(@PathVariable("sprintId") String sprintId) {
		return sprintReportService.getTaskboardSprintReports(UUID.fromString(sprintId));
	}

}
