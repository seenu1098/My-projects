package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroapps.vo.OrganizationVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.service.OrganizationService;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@RestController
@RequestMapping("/organization/v1/")
public class OrganizationController {
	@Autowired
	private OrganizationService organizationService;

	private final ObjectMapper mapper = new ObjectMapper();

	@PostMapping(path = "/update")
	public ResponseStringVO createCustomer(@RequestParam("data") String data,
			@RequestParam(value = "custom-attribute", required = false) String customAttribute,
			@RequestParam(value = "file", required = false) List<MultipartFile> file) throws IOException {

		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		OrganizationVO organizationVO = mapper.readValue(data, OrganizationVO.class);

		try {
			return organizationService.updateOrganization(organizationVO, file, customAttribute);
		} finally {
			YorosisContext.clear();
		}
	}

	@GetMapping("/get")
	public OrganizationVO getCustomerInfo() throws IOException {
		return organizationService.getOrganizationInfo();
	}
}
