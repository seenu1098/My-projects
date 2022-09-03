package com.yorosis.livetester.service;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.yorosis.livetester.entities.Template;
import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.repo.TemplateRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.vo.ClaimServiceVO;
import com.yorosis.livetester.vo.DuplicateTemplateVO;
import com.yorosis.livetester.vo.ResponseVO;
import com.yorosis.livetester.vo.TemplateVO;
import com.yorosis.livetester.vo.TestcaseVO;

@Service
public class TemplateService {

	@Autowired
	private TemplateRepository templateRepository;

	@Transactional
	public ResponseVO saveTemplate(TestcaseVO claimVO) throws YorosisException, IOException {
		ObjectMapper mapper = new ObjectMapper();
		ObjectWriter writer = mapper.writer();
		String message = "Template created successfully";

		JsonNode convertedObject = mapper.readValue(claimVO.getClaimHeader().getExpectedElements(), JsonNode.class);
		claimVO.getClaimHeader().setExpectedResult(convertedObject);
		for (ClaimServiceVO service : claimVO.getServices()) {
			service.setExpectedResult(mapper.readValue(service.getExpectedElements(), JsonNode.class));
		}
		String jsonData = writer.writeValueAsString(claimVO);
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		String user = YorosisContext.get().getUserName();
		Template template = Template.builder().jsonData(jsonData).templateName(claimVO.getTemplateName()).createdDate(timestamp).updatedDate(timestamp).createdBy(user)
				.updatedBy(user).build();
		int count = templateRepository.getTemplateCount(claimVO.getTemplateName());

		if (count > 0 && claimVO.getTemplateId() == null) {
			message = "Template Name already exist";
			return ResponseVO.builder().response(message).build();
		}

		if (claimVO.getTemplateId() != null && claimVO.getTemplateId() > 0) {
			Optional<Template> dbTemplate = templateRepository.findById(claimVO.getTemplateId());
			if (dbTemplate.isPresent()) {
				template = dbTemplate.get();
				template.setJsonData(jsonData);
				template.setUpdatedDate(timestamp);
				template.setUpdatedBy(user);
				message = "Template updated successfully";
			} else {
				throw new YorosisException("Templated id not in db");
			}
		}
		templateRepository.save(template);

		return ResponseVO.builder().response(message).build();
	}

	@Transactional
	public TestcaseVO getTemplateDetails(Long id) throws IOException {
		ObjectMapper mapper = new ObjectMapper();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		Template template = templateRepository.getOne(id);

		TestcaseVO claimVO = mapper.readValue(template.getJsonData(), TestcaseVO.class);
		claimVO.setTemplateId(template.getId());

		return claimVO;
	}

	@Transactional
	public List<TemplateVO> getTemplateList() {
		List<Template> templateNameList = templateRepository.findAllByOrderByIdDesc();

		List<TemplateVO> responseList = new ArrayList<>();
		for (Template template : templateNameList) {
			responseList.add(TemplateVO.builder().id(template.getId()).templateName(template.getTemplateName()).build());
		}

		return responseList;
	}

	@Transactional
	public boolean getAccess(Long id) {
		Template template = templateRepository.getOne(id);
		return (YorosisContext.get().isGlobalAccess() || StringUtils.equalsIgnoreCase(template.getCreatedBy(), YorosisContext.get().getUserName()));
	}

	@Transactional
	public ResponseVO deleteTemplateDetails(Long id) {
		String message = null;
		int deleted = 0;

		if (templateRepository.getOne(id).getClaims().isEmpty()) {
			templateRepository.deleteById(id);
			message = "Template deleted Successfully";
			deleted = 1;
		} else {
			message = "Claims uses this template";
		}

		return ResponseVO.builder().response(message).isDeleted(deleted).build();
	}

	@Transactional
	public ResponseVO saveDuplicateTemplate(DuplicateTemplateVO duplicateTemplateVO) {

		String user = YorosisContext.get().getUserName();

		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		String msg = null;
		int count = templateRepository.getTemplateCount(duplicateTemplateVO.getTemplateName());
		if (count > 0) {
			msg = "Template Name already exist";
		} else {
			Template existingtemplate = templateRepository.getOne(duplicateTemplateVO.getTemplateId());

			Template template = Template.builder().jsonData(existingtemplate.getJsonData()).templateName(duplicateTemplateVO.getTemplateName()).createdDate(timestamp)
					.updatedDate(timestamp).createdBy(user).updatedBy(user).build();

			templateRepository.save(template);
			msg = "Duplicate Template Created Successfully";
		}
		return ResponseVO.builder().response(msg).build();
	}
}
