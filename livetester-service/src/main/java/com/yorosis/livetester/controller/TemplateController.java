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
import com.yorosis.livetester.service.TemplateService;
import com.yorosis.livetester.vo.DuplicateTemplateVO;
import com.yorosis.livetester.vo.ResponseVO;
import com.yorosis.livetester.vo.TemplateVO;
import com.yorosis.livetester.vo.TestcaseVO;

@RestController
@CrossOrigin
@RequestMapping("/template/v1")
public class TemplateController {

	@Autowired
	private TemplateService templateClaimService;

	@PostMapping("/save")
	public ResponseVO saveClaimsDetails(@RequestBody TestcaseVO vo) throws YorosisException, IOException {
		return templateClaimService.saveTemplate(vo);
	}

	@GetMapping("/get-list")
	public List<TemplateVO> getTemplateList() {
		return templateClaimService.getTemplateList();
	}

	@GetMapping("/get-info/{id}")
	public TestcaseVO getTemplateInfo(@PathVariable Long id) throws IOException {
		return templateClaimService.getTemplateDetails(id);
	}

	@DeleteMapping("/delete/{id}")
	public ResponseVO deleteTemplateInfo(@PathVariable Long id) {
		return templateClaimService.deleteTemplateDetails(id);
	}

	@GetMapping("/get-access-info/{id}")
	public boolean getTemplateAccessInfo(@PathVariable Long id) {
		return templateClaimService.getAccess(id);
	}

	@PostMapping("save-duplicate")
	public ResponseVO saveDuplicateTemplate(@RequestBody DuplicateTemplateVO duplicateTemplateVO)  {
		return templateClaimService.saveDuplicateTemplate(duplicateTemplateVO);
	}

}
