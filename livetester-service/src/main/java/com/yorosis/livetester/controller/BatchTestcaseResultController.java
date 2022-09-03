package com.yorosis.livetester.controller;

import java.io.IOException;
import java.util.List;

import javax.xml.transform.TransformerException;

import org.apache.commons.lang3.StringUtils;
import org.apache.fop.apps.FOPException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.service.BatchTestCaseService;
import com.yorosis.livetester.service.BatchTestcaseResultService;
import com.yorosis.livetester.vo.BatchRerunVO;
import com.yorosis.livetester.vo.BatchTestcaseResultVO;
import com.yorosis.livetester.vo.PdfResponseVO;
import com.yorosis.livetester.vo.PrintTestResultsVO;
import com.yorosis.livetester.vo.RequeryResultVO;
import com.yorosis.livetester.vo.ResponseVO;

@RestController
@CrossOrigin
@RequestMapping("/batch-result/v1")
public class BatchTestcaseResultController {

	@Autowired
	private BatchTestcaseResultService batchTestcaseResultService;

	@Autowired
	private BatchTestCaseService batchTestCaseService;
	private static final String APPLICATION_PDF = "application/pdf";

	@GetMapping("/get/{id}")
	public BatchTestcaseResultVO getClaimDetails(@PathVariable(name = "id") long id) {
		return batchTestcaseResultService.getBatchTestcaseResultData(id);
	}

	@PostMapping("/requery-result")
	public ResponseVO requeryResult(@RequestBody RequeryResultVO requeryResultVO) throws YorosisException {
		return batchTestCaseService.requeryResult(requeryResultVO);
	}

	@GetMapping("/get-batchtestcase/{id}")
	public List<Long> getBatchTestcase(@PathVariable(name = "id") Long id) {
		return batchTestCaseService.getBatchTestcase(id);
	}

	@PostMapping(path = "/get-file-name")
	public PdfResponseVO getFileName(@RequestBody PrintTestResultsVO printTestResultsVO) {
		return batchTestCaseService.getBatchName(printTestResultsVO);
	}

	@PostMapping(path = "/get-pdf-response", produces = APPLICATION_PDF)
	public ResponseEntity<byte[]> getPdfResponse(@RequestBody PrintTestResultsVO printTestResultsVO) throws IOException, FOPException, TransformerException {
		byte[] document = batchTestCaseService.getPdf(printTestResultsVO);
		String type = "zip";
		if (StringUtils.equals(printTestResultsVO.getPdfOption(), "Y")) {
			type = "pdf";
		}
		
		HttpHeaders header = new HttpHeaders();
		header.setContentType(new MediaType("application", type));
		header.setContentLength(document.length);
		return new ResponseEntity<>(document, header, HttpStatus.OK);
	}
	
	@GetMapping("/get-batch-rerun-testcases/{batchId}")
	public BatchRerunVO getBatchRerunVO(@PathVariable(name = "batchId") Long batchId) throws IOException {
		return batchTestCaseService.getBatchRerunInfo(batchId);
	}
	
	@GetMapping("/demo-pass-fail/{passOrFail}/{batchId}")
	public ResponseVO getBatchResult(@PathVariable(name = "passOrFail") String passOrFail, @PathVariable(name = "batchId") Long batchId)  {
		batchTestCaseService.processPassOrFailForDemo(batchId, passOrFail);
		
		return ResponseVO.builder().response("Completed").build();
	}
}
