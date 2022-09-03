package com.yorosis.livetester.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.annotation.PostConstruct;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.livetester.entities.LookupData;
import com.yorosis.livetester.repo.LookupDataRepository;
import com.yorosis.livetester.security.YorosisContext;
import com.yorosis.livetester.vo.LookupDataVO;
import com.yorosis.livetester.vo.ResponseVO;

@Service
public class LookupDataService {
	private static final String FORM_TYPE = "form_type";
	@Autowired
	private LookupDataRepository lookUpDataRepository;

	@PostConstruct
	private void initializeFormTypesIfNotExists() {
		Map<String, String> formTypeMap = new HashMap<>();
		formTypeMap.put("P", "Professional");
		formTypeMap.put("I", "Institutional");
		formTypeMap.put("D", "Dental");
		checkAndInsert(formTypeMap, FORM_TYPE);
		
		Map<String, String> frequencyTypeMap = new HashMap<>();
		frequencyTypeMap.put("1", "Fresh Claim");
		frequencyTypeMap.put("7", "Adjustment / Resurrection");
		frequencyTypeMap.put("8", "Void");
		checkAndInsert(frequencyTypeMap, "Frequency");
	
		Map<String, String> sourceTypeMap = new HashMap<>();
		sourceTypeMap.put("E", "EDI");
		sourceTypeMap.put("P", "Paper");
		sourceTypeMap.put("W", "Web");
		checkAndInsert(sourceTypeMap, "Source");
		
	}

	private void checkAndInsert(Map<String, String> map, String type) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		
		for (Entry<String, String> entry : map.entrySet()) {
			LookupData formTypeLookupData = lookUpDataRepository.findByCodeAndType(entry.getKey(), type);
			if (formTypeLookupData != null && formTypeLookupData.getId() > 0) {
				// good
			} else {
				LookupData lookupData = LookupData.builder().type(type).code(entry.getKey()).description(entry.getValue()).createdBy("system")
						.updatedBy("system").createdDate(timestamp).updatedDate(timestamp).build();
				lookUpDataRepository.save(lookupData);
			}
		}
	}
	
	private LookupDataVO constructDTOToVO(LookupData data) {
		return LookupDataVO.builder().code(data.getCode()).id(data.getId()).description(data.getDescription()).type(data.getType()).build();
	}

	@Transactional
	public ResponseVO saveLookupData(LookupDataVO lookupDataVo) {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());

		LookupData lookupData = LookupData.builder().code(lookupDataVo.getCode()).description(lookupDataVo.getDescription()).type(lookupDataVo.getType())
				.createdDate(currentTimestamp).createdBy(YorosisContext.get().getUserName()).updatedDate(currentTimestamp)
				.updatedBy(YorosisContext.get().getUserName()).build();
		String message = "Lookup Data created successfully";

		if (lookupDataVo.getId() != null && lookupDataVo.getId() > 0) {
			lookupData = lookUpDataRepository.getOne(lookupDataVo.getId());
			lookupData.setDescription(lookupDataVo.getDescription());
			lookupData.setUpdatedBy(YorosisContext.get().getUserName());
			lookupData.setUpdatedDate(currentTimestamp);
			message = "Lookup Data updated successfully";
		}
		lookUpDataRepository.save(lookupData);

		return ResponseVO.builder().response(message).build();
	}

	@Transactional
	public List<LookupDataVO> getlookupDataList(String type) {
		List<LookupDataVO> lookuplist = new ArrayList<>();

		List<LookupData> lookupDataByTypeList = lookUpDataRepository.getLookUpdataByType(type);
		for (LookupData lookupData : lookupDataByTypeList) {
			LookupDataVO lookupVO = LookupDataVO.builder().id(lookupData.getId()).code(lookupData.getCode()).description(lookupData.getDescription()).build();
			lookuplist.add(lookupVO);
		}

		return lookuplist;
	}

	@Transactional
	public ResponseVO deletelookupDataList(Long id) {
		String message = "Lookup Data deleted successfully";

		lookUpDataRepository.deleteById(id);
		return ResponseVO.builder().response(message).isDeleted(1).build();
	}

	@Transactional
	public List<LookupDataVO> getlookupDataListVO() {
		List<LookupDataVO> lookuplist = new ArrayList<>();

		List<LookupData> submitter = lookUpDataRepository.findAllByOrderByIdDesc();
		for (LookupData lookupData : submitter) {
			if (!StringUtils.equalsIgnoreCase(FORM_TYPE, lookupData.getType())) {
				LookupDataVO lookupVO = constructDTOToVO(lookupData);
				lookuplist.add(lookupVO);
			}
		}

		return lookuplist;
	}

	@Transactional
	public LookupDataVO getLookupDataInfo(Long id) {
		return constructDTOToVO(lookUpDataRepository.getOne(id));
	}
}
