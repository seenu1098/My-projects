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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.yorosis.livetester.service.BeneficiaryPresetService;
import com.yorosis.livetester.service.PAPresetService;
import com.yorosis.livetester.service.PayorPresetService;
import com.yorosis.livetester.service.ProviderPresetService;
import com.yorosis.livetester.vo.BeneficiaryVO;
import com.yorosis.livetester.vo.EnvironmentPresetVO;
import com.yorosis.livetester.vo.PaVO;
import com.yorosis.livetester.vo.PayorVO;
import com.yorosis.livetester.vo.ProviderVO;
import com.yorosis.livetester.vo.ResponseVO;

@RestController
@CrossOrigin
@RequestMapping("/environment-preset/v1")
public class EnvironmentPresetController {
	@Autowired
	private BeneficiaryPresetService beneficiaryPresetService;

	@Autowired
	private ProviderPresetService providerPresetService;

	@Autowired
	private PayorPresetService payorPresetService;

	@Autowired
	private PAPresetService pAPresetService;

	@GetMapping("/get-beneficiary-info/{envName}/{identifier}")
	public EnvironmentPresetVO getEnvironmentBeneficiaryInfo(@PathVariable("envName") String envName, @PathVariable("identifier") String identifier) throws IOException {
		return beneficiaryPresetService.getEnviromentPresetDetails(envName, identifier);
	}

	@PostMapping("/save-beneficiary-details")
	public ResponseVO saveEnvironmentBeneficiaryDetails(@RequestBody EnvironmentPresetVO vo) throws JsonProcessingException {
		return beneficiaryPresetService.saveBeneficiaryPreset(vo);
	}

	@DeleteMapping("/delete-beneficiary-details/{id}")
	public ResponseVO deleteEnvironmentBeneficiaryInfo(@PathVariable Long id) {
		return beneficiaryPresetService.deleteBeneficiaryPreset(id);
	}

	@GetMapping("/get-payor-info/{envName}/{identifier}")
	public EnvironmentPresetVO getEnvironmentPayorInfo(@PathVariable("envName") String envName, @PathVariable("identifier") String identifier) throws IOException {
		return payorPresetService.getEnviromentPayorPresetDetails(envName, identifier);
	}

	@PostMapping("/save-payor-details")
	public ResponseVO saveEnvironmentPayorDetails(@RequestBody EnvironmentPresetVO vo) throws JsonProcessingException {
		return payorPresetService.savePayorPreset(vo);
	}

	@DeleteMapping("/delete-payor-details/{id}")
	public ResponseVO deleteEnvironmentPayorInfo(@PathVariable Long id) {
		return payorPresetService.deletePayorPreset(id);
	}

	@GetMapping("/get-provider-info/{envName}/{npi}")
	public EnvironmentPresetVO getEnvironmentProviderInfo(@PathVariable("envName") String envName, @PathVariable("npi") String npi) throws IOException {
		return providerPresetService.getEnviromentProviderPresetDetails(envName, npi);
	}

	@PostMapping("/save-provider-details")
	public ResponseVO saveEnvironmentProviderDetails(@RequestBody EnvironmentPresetVO vo) throws JsonProcessingException {
		return providerPresetService.saveProviderPreset(vo);
	}

	@DeleteMapping("/delete-provider-details/{id}")
	public ResponseVO deleteEnvironmentProviderInfo(@PathVariable Long id) {
		return providerPresetService.deleteProviderPreset(id);
	}

	@GetMapping("/get-pa-info/{envName}/{number}")
	public EnvironmentPresetVO getEnvironmentPaInfo(@PathVariable("envName") String envName, @PathVariable("number") String number) throws IOException {
		return pAPresetService.getEnviromentPaPresetDetails(envName, number);
	}

	@PostMapping("/save-pa-details")
	public ResponseVO saveEnvironmentPaDetails(@RequestBody EnvironmentPresetVO vo) throws JsonProcessingException {
		return pAPresetService.savePaPreset(vo);
	}

	@DeleteMapping("/delete-pa-details/{id}")
	public ResponseVO deleteEnvironmentPaInfo(@PathVariable Long id) {
		return pAPresetService.deletePaPreset(id);
	}

	@GetMapping("/get-beneficiary-list/{key}")
	public List<BeneficiaryVO> getListOfBeneficiaryVO(@PathVariable String key) throws IOException {
		return beneficiaryPresetService.getBeneficiaryVOList(key);
	}

	@GetMapping("/get-provider-list/{key}")
	public List<ProviderVO> getListOfProviderVO(@PathVariable String key) throws IOException {
		return providerPresetService.getProviderVOList(key);
	}

	@GetMapping("/get-payor-list/{key}")
	public List<PayorVO> getListOfPayorrVO(@PathVariable String key) throws IOException {
		return payorPresetService.getPayorVOList(key);
	}

	@GetMapping("/get-pa-vo-list/{key}")
	public List<PaVO> getListOfPaVO(@PathVariable String key) throws IOException {
		return pAPresetService.getPaVOList(key);
	}

}
