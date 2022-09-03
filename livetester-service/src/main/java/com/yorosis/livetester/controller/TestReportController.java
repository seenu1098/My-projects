package com.yorosis.livetester.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.service.TestReportService;
import com.yorosis.livetester.vo.TestReportVO;

@RestController
@RequestMapping("/test-report/v1")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TestReportController {

	@Autowired
	private TestReportService testReportService;

	@PostMapping("/get")
	public TestReportVO generateTestReport(@RequestBody TestReportVO testReportVO) throws YorosisException {
		return testReportService.getTestReport(testReportVO);
	}
}