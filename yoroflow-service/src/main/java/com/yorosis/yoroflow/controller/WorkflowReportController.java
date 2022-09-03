package com.yorosis.yoroflow.controller;

import java.io.IOException;
import java.text.ParseException;
import java.util.List;
import java.util.UUID;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.models.PageFieldVo;
import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.ReportGenerationVo;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.TaskDetailsVO;
import com.yorosis.yoroflow.models.WorkflowReportVo;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.services.WorkflowReportService;

@RestController
@RequestMapping("/workflow-report/v1/")
public class WorkflowReportController {

	@Autowired
	private WorkflowReportService workflowReportService;

	@PostMapping("save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ResponseStringVO save(@RequestBody WorkflowReportVo workflowReportVo) throws IOException {
		return workflowReportService.save(workflowReportVo);
	}

	@GetMapping("get/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public WorkflowReportVo getWorkFlowReport(@PathVariable(name = "id") String id) {
		return workflowReportService.getWorkFlowReport(UUID.fromString(id));
	}

	@GetMapping("/get/workflow-taskName/{key}/{version}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<TaskDetailsVO> getWorkflowTaskName(@PathVariable(name = "key") String key,
			@PathVariable(name = "version") long version) {
		return workflowReportService.getTaskNameBasedOnWorkflow(key, version);
	}

	@GetMapping("/get/field-name/{taskId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public List<PageFieldVo> getWorkflowFieldValuesForTaskName(@PathVariable(name = "taskId") String taskId) {
		return workflowReportService.getFieldValuesBasedOnTask(UUID.fromString(taskId));
	}

	@PostMapping("/get-report")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public ReportGenerationVo getReport(@RequestBody PaginationVO paginationVO) throws ParseException {
		return workflowReportService.getValues(paginationVO);
	}

	@PostMapping("/get-excel")
	@Transactional(readOnly = true)
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','Workflow User','User','Guest'})")
	public void getExcelData(@RequestBody PaginationVO report, HttpServletResponse response)
			throws YoroFlowException, ParseException {
		workflowReportService.getExcelForTotalRecords(report, response);
	}

//	@GetMapping("/get-excel/{reportId}")
//	@Transactional(readOnly = true)
//	public void getExcelFullData(@PathVariable(name = "reportId") String reportId, HttpServletResponse response) throws YoroFlowException, ParseException {
//		workflowReportService.getExcelForTotalRecords(UUID.fromString(reportId), response);
//	}

}
