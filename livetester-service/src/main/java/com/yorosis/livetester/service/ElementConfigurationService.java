package com.yorosis.livetester.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.livetester.entities.ElementsConfiguration;
import com.yorosis.livetester.repo.ElementConfigRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.vo.ElementConfigListVO;
import com.yorosis.livetester.vo.ElementConfigVO;
import com.yorosis.livetester.vo.ResponseVO;

@Service
public class ElementConfigurationService {
	@Autowired
	private ElementConfigRepository elementConfigRepository;

	public ElementsConfiguration constructVOToDTO(ElementConfigVO vo) {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		String userName = YorosisContext.get().getUserName();

		return ElementsConfiguration.builder().elementLabel(vo.getLabel()).fieldName(vo.getFieldName())
				.fieldType(vo.getFieldType()).applicableAt(vo.getApplicable()).isMandatory(vo.getMandatory())
				.createdBy(userName).createdDate(currentTimestamp).updatedBy(userName).updatedDate(currentTimestamp)
				.matchQuery(vo.getMatchQuery()).fallbackQuery1(vo.getFallbackQuery1())
				.fallbackQuery2(vo.getFallbackQuery2()).controlType(vo.getControlType()).json(vo.getJson()).build();
	}

	public ElementConfigVO constructDTOToVO(ElementsConfiguration element) {
		return ElementConfigVO.builder().label(element.getElementLabel()).fieldName(element.getFieldName())
				.fieldType(element.getFieldType()).mandatory(element.getIsMandatory())
				.controlType(element.getControlType()).json(element.getJson()).matchQuery(element.getMatchQuery())
				.applicable(element.getApplicableAt()).id(element.getId()).fallbackQuery1(element.getFallbackQuery1())
				.fallbackQuery2(element.getFallbackQuery2()).build();
	}

	@Transactional
	public ResponseVO saveElementConfigurationData(ElementConfigVO vo) {
		String message = null;
		ElementsConfiguration element = elementConfigRepository.findByElementLabel(vo.getLabel());
		int lableCount = elementConfigRepository.getLabelCount(vo.getLabel());

		if (vo.getId() == null) {
			if (lableCount == 0) {
				ElementsConfiguration data = constructVOToDTO(vo);
				elementConfigRepository.save(data);
				message = "Element Configuration created successfully";
			} else {
				message = "Element Label Already Exist";
			}
		} else {
			element.setFieldName(vo.getFieldName());
			element.setFieldType(vo.getFieldType());
			element.setIsMandatory(vo.getMandatory());
			element.setMatchQuery(vo.getMatchQuery());
			element.setFallbackQuery1(vo.getFallbackQuery1());
			element.setFallbackQuery2(vo.getFallbackQuery2());
			element.setUpdatedBy(YorosisContext.get().getUserName());
			element.setUpdatedDate(new Timestamp(System.currentTimeMillis()));
			element.setControlType(vo.getControlType());
			element.setJson(vo.getJson());
			elementConfigRepository.save(element);
			message = "Element Configuration updated successfully";
		}

		return ResponseVO.builder().response(message).build();
	}

	@Transactional
	public ElementConfigVO getElementConfigInfo(long id) {
		ElementsConfiguration elementConfigurationData = elementConfigRepository.findById(id);
		return constructDTOToVO(elementConfigurationData);
	}

	@Transactional
	public List<ElementConfigListVO> getElementConfigList(String applicableAt) {
		List<ElementsConfiguration> elementConfigNameList = null;
		if (StringUtils.equalsIgnoreCase("list", applicableAt)) {
			elementConfigNameList = elementConfigRepository.findAllByOrderByIdDesc();
		} else if (StringUtils.equalsIgnoreCase("Header", applicableAt)) {
			elementConfigNameList = elementConfigRepository.findAllByApplicableAt(applicableAt);
		} else if (StringUtils.equalsIgnoreCase("Line", applicableAt)) {
			elementConfigNameList = elementConfigRepository.findAllByApplicableAt(applicableAt);
		}

		List<ElementConfigListVO> responseList = new ArrayList<>();
		for (ElementsConfiguration element : elementConfigNameList) {
			responseList.add(ElementConfigListVO.builder().id(element.getId())
					.labelNames(element.getApplicableAt() + " - " + element.getElementLabel())
					.elementLabel(element.getElementLabel()).fieldName(element.getFieldName())
					.fieldType(element.getFieldType()).applicableAt(element.getApplicableAt())
					.isMandatory(element.getIsMandatory()).controlType(element.getControlType()).json(element.getJson())
					.build());
		}

		return responseList;
	}

	@Transactional
	public ResponseVO deleteElementConfigInfo(Long id) {
		String message = "Element Configuration have test case result";
		int deleted = 0;

		if (elementConfigRepository.getOne(id).getBatchTestcasesResult().isEmpty()) {
			elementConfigRepository.deleteById(id);
			message = "Element Configuration deleted Successfully";
			deleted = 1;
		}

		return ResponseVO.builder().response(message).isDeleted(deleted).build();
	}
}
