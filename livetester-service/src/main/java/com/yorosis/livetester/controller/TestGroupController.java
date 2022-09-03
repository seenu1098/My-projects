package com.yorosis.livetester.controller;

import java.io.IOException;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.service.TestGroupService;
import com.yorosis.livetester.vo.EnvironmentPresetVO;
import com.yorosis.livetester.vo.ReplaceAndExecuteVO;
import com.yorosis.livetester.vo.ReplacementOptionVO;
import com.yorosis.livetester.vo.ResponseVO;
import com.yorosis.livetester.vo.TestExecutionVO;
import com.yorosis.livetester.vo.TestcaseGroupVO;
import com.yorosis.livetester.vo.UniqueBeneficiaryVO;
import com.yorosis.livetester.vo.UniquePAVO;
import com.yorosis.livetester.vo.UniquePayorVO;
import com.yorosis.livetester.vo.UniqueProviderVO;

@RestController
@CrossOrigin
@RequestMapping("/testcase-group/v1")
public class TestGroupController {

	@Autowired
	private TestGroupService testGroupService;

	@PostMapping("/save")
	public ResponseVO saveTestGroup(@RequestBody TestcaseGroupVO testGroupVO) {
		return testGroupService.saveTestGroup(testGroupVO);
	}

	@GetMapping("/get")
	public List<TestcaseGroupVO> getCaseTestGroup() throws IOException {
		return testGroupService.getTestGroup();
	}

	@GetMapping("/list")
	public List<TestcaseGroupVO> getTestCaseGroupList() {
		return testGroupService.getListOfTestCaseGroups();
	}

	@GetMapping("/testcase/{id}")
	public TestcaseGroupVO getTestCaseGroupInfo(@PathVariable long id) {
		return testGroupService.getListOfTestCaseInfo(id);
	}

	@GetMapping("/delete/{id}")
	public ResponseVO deleteTestCaseGroupInfo(@PathVariable Long id) {
		return testGroupService.deleteTestCaseGroup(id);
	}

	@PostMapping("/replacement")
	public List<EnvironmentPresetVO> getReplacementDetails(@RequestBody ReplacementOptionVO replacementVO) throws IOException, YorosisException {
		return testGroupService.getReplacementDetails(replacementVO);
	}

	@PostMapping("/beneficary")
	public Set<UniqueBeneficiaryVO> getUique(@RequestBody TestExecutionVO testExecutionVO) {
		return testGroupService.getUniqueBeneficary(testExecutionVO);
	}

	@PostMapping("/provider")
	public Set<UniqueProviderVO> getProvider(@RequestBody TestExecutionVO testExecutionVO) {
		return testGroupService.getUniqueProvider(testExecutionVO);
	}

	@PostMapping("/payor")
	public Set<UniquePayorVO> getPayor(@RequestBody TestExecutionVO testExecutionVO) {
		return testGroupService.getUniquePayor(testExecutionVO);
	}

	@PostMapping("/pa")
	public Set<UniquePAVO> getPA(@RequestBody TestExecutionVO testExecutionVO) {
		return testGroupService.getUniquePA(testExecutionVO);
	}

	@PostMapping("/replace-execute")
	public ResponseVO replaceAndExecute(@RequestBody ReplaceAndExecuteVO replacementAndExecuteVO) throws IOException {
		return testGroupService.replaceAndExecute(replacementAndExecuteVO);
	}
	
	@GetMapping("/check/{batchName}")
	public int checkBtchName(@PathVariable String batchName) {
		return testGroupService.checkBatchName(batchName);
	}

}
