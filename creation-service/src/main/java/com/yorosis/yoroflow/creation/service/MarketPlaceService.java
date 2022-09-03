package com.yorosis.yoroflow.creation.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.yorosis.yoroapps.entities.MarketPlaceEntity;
import com.yorosis.yoroapps.vo.MarketPlaceVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.MarketPlaceRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class MarketPlaceService {
	@Autowired
	private MarketPlaceRepository marketPlaceRepo;

	private MarketPlaceEntity constructVOtoDTO(MarketPlaceVO marketPlaceVO) throws JsonMappingException, JsonProcessingException {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return MarketPlaceEntity.builder().exportData(marketPlaceVO.getJsonData()).activeFlag(YoroappsConstants.YES)
				.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp).publishedOn(marketPlaceVO.getUpdatedDate())
				.tenantId(YorosisContext.get().getTenantId()).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.processDefinitionName(marketPlaceVO.getUploadWorkflows()).description(marketPlaceVO.getDescription())
				.developerName(marketPlaceVO.getDeveloperName()).approve(marketPlaceVO.getApprove()).startKey(marketPlaceVO.getStartKey()).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO save(MarketPlaceVO maPlaceVo) throws JsonProcessingException {
		MarketPlaceEntity marketPlaceEntity = constructVOtoDTO(maPlaceVo);
		marketPlaceRepo.save(marketPlaceEntity);
		return ResponseStringVO.builder().response("Workflow Uploaded Successfully").build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public List<MarketPlaceVO> getMarketPlace() {
		List<MarketPlaceVO> marketPlaceVOList = new ArrayList<>();
		for (MarketPlaceEntity marketPlaceEntity : marketPlaceRepo.findByTenantIdAndActiveFlagIgnoreCase(YorosisContext.get().getTenantId(),
				YoroappsConstants.YES)) {
			MarketPlaceVO marketPlaceVO = MarketPlaceVO.builder().id(marketPlaceEntity.getId()).uploadWorkflows(marketPlaceEntity.getProcessDefinitionName())
					.noOfInstalledCounts(marketPlaceEntity.getInstalledCount()).updatedDate(marketPlaceEntity.getPublishedOn())
					.description(marketPlaceEntity.getDescription()).developerName(marketPlaceEntity.getDeveloperName()).approve(marketPlaceEntity.getApprove())
					.startKey(marketPlaceEntity.getStartKey()).build();
			marketPlaceVOList.add(marketPlaceVO);
		}
		return marketPlaceVOList;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO setInstalledCounts(String processDefinitionName, String installFrom) {
		MarketPlaceEntity marketPlaceEntity = marketPlaceRepo.findByProcessDefinitionName(processDefinitionName);
		if (!StringUtils.equalsIgnoreCase(installFrom, "yoroAdmin")) {
			marketPlaceEntity.setInstalledCount(marketPlaceEntity.getInstalledCount() + 1);
			marketPlaceRepo.save(marketPlaceEntity);
		}
		return ResponseStringVO.builder().data(marketPlaceEntity.getExportData()).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO setUninstalledCounts(String processDefinitionName) {
		MarketPlaceEntity marketPlaceEntity = marketPlaceRepo.findByProcessDefinitionName(processDefinitionName);
		marketPlaceEntity.setUninstalledCount(marketPlaceEntity.getUninstalledCount() + 1);
		marketPlaceEntity.setInstalledCount(marketPlaceEntity.getInstalledCount() - 1);
		marketPlaceRepo.save(marketPlaceEntity);
		return ResponseStringVO.builder().response("Count Updated").build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO disableWorkflow(String processDefinitionName, String type) {
		MarketPlaceEntity marketPlaceEntity = marketPlaceRepo.findByProcessDefinitionName(processDefinitionName);
		if (StringUtils.equalsIgnoreCase(type, "approve")) {
			marketPlaceEntity.setApprove("Y");
		} else if (StringUtils.equalsIgnoreCase(type, "disable")) {
			marketPlaceEntity.setApprove("N");
		}
		marketPlaceRepo.save(marketPlaceEntity);
		return ResponseStringVO.builder().response("Disabled Workflow").build();
	}
}
