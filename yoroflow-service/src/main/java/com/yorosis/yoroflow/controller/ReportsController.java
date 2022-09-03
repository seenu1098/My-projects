package com.yorosis.yoroflow.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.models.LineChartVO;
import com.yorosis.yoroflow.models.ReportsDashboardVO;
import com.yorosis.yoroflow.models.UsersVO;
import com.yorosis.yoroflow.services.ReportService;
import com.yorosis.yoroflow.services.UserService;

@RestController
@RequestMapping("/reports/v1")
public class ReportsController {

	@Autowired
	private ReportService reportService;

	@Autowired
	private UserService userService;

	@PostMapping("/get/total-task-reports")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public LineChartVO getTotalTaskReports(@RequestBody ReportsDashboardVO vo) {
		return reportService.getTotalTaskReports(vo);
	}

	@PostMapping("/get/total-completed-task-by-user")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public LineChartVO getTotalCompletedTaskByUser(@RequestBody ReportsDashboardVO vo) {
		return reportService.getTotalCompletedTaskByUser(vo);
	}

	@PostMapping("/get/total-average-time")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public LineChartVO getTotalAverageTime(@RequestBody ReportsDashboardVO vo) {
		return reportService.getTotalAverageTimeOfCompletedTaskPerDay(vo);
	}

	@GetMapping("/get/users/list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<UsersVO> getUserList() {
		return userService.getAllUsers();
	}

}
