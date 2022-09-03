package com.yorosis.livetester.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.service.TestcasesService;
import com.yorosis.livetester.vo.DuplicateTestcaseVO;
import com.yorosis.livetester.vo.ResponseVO;
import com.yorosis.livetester.vo.TestcaseGroupVO;
import com.yorosis.livetester.vo.TestcaseVO;
import com.yorosis.livetester.vo.TestcaseWrapperVO;

@RestController
@CrossOrigin
@RequestMapping("/testcase/v1")
public class TestcasesController {

	@Autowired
	private TestcasesService testcasesService;

	@PostMapping("/save")
	public ResponseVO saveClaimsDetails(@RequestBody TestcaseWrapperVO vo) throws IOException, YorosisException {
		return testcasesService.saveTestcase(vo);
	}

	@PostMapping("/update")
	public ResponseVO updateClaimsDetails(@RequestBody TestcaseWrapperVO vo) throws IOException, YorosisException {
		return testcasesService.updateTestcase(vo);
	}

	@GetMapping("/testgroup")
	public List<TestcaseGroupVO> getTestGroup() {
		return testcasesService.getTestGroup();
	}

	@GetMapping("/get-details/{id}")
	public TestcaseWrapperVO getClaimDetails(@PathVariable(name = "id") Long id) throws IOException {
		return testcasesService.getTestcaseDetailsForUpdate(id);
	}

	@GetMapping("/get-info/{id}")
	public TestcaseVO getTestGroup(@PathVariable Long id) throws IOException {
		return testcasesService.getTestcaseDetails(id);
	}

	@DeleteMapping("/delete/{id}")
	public ResponseVO deleteClaimInfo(@PathVariable Long id) {
		return testcasesService.deleteTestcase(id);
	}

	@PostMapping("/save-duplicate")
	public ResponseVO saveDuplicateClaim(@RequestBody DuplicateTestcaseVO duplicateClaimVO) {
		return testcasesService.saveDuplicateTestcase(duplicateClaimVO);
	}

}
