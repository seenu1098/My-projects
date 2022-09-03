package com.yorosis.yoroflow.creation.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import javax.transaction.Transactional;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.yorosis.yoroapps.entities.InstalledApps;
import com.yorosis.yoroapps.vo.InstallAppVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.InstalledAppRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class InstallAppService {

	@Autowired
	private InstalledAppRepository installedAppRepository;

	@Autowired
	private MarketPlaceService marketPlaceService;

	private InstalledApps constructVOtoDTO(InstallAppVO installAppVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return InstalledApps.builder().processDefinitionName(installAppVO.getProcessDefinitionName()).activeFlag(YoroappsConstants.YES)
				.createdBy(YorosisContext.get().getUserName()).description(installAppVO.getDescription()).createdOn(timestamp)
				.tenantId(YorosisContext.get().getTenantId()).modifiedBy(YorosisContext.get().getUserName()).startKey(installAppVO.getStartKey())
				.modifiedOn(timestamp).build();
	}

	@Transactional
	public ResponseStringVO save(InstallAppVO installAppVO) {
		String response = null;
		ResponseStringVO responseVO = null;
		JsonNode jsonNode = null;
		if (installAppVO.getId() == null) {
			YorosisContext currentContext = YorosisContext.get();
			try {
				YorosisContext.clear();
				YorosisContext context = YorosisContext.builder().tenantId(YoroappsConstants.DEFAULT_SCHEMA).build();
				YorosisContext.set(context);
				responseVO = marketPlaceService.setInstalledCounts(installAppVO.getProcessDefinitionName(), installAppVO.getInstallFrom());
			} finally {
				YorosisContext.clear();
				YorosisContext.set(currentContext);
			}
			if (!StringUtils.equalsIgnoreCase(installAppVO.getInstallFrom(), "yoroAdmin")) {
				InstalledApps installedApps = constructVOtoDTO(installAppVO);
				installedAppRepository.save(installedApps);
			}
			response = "Application Installed Successfully";
		} else {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			InstalledApps installedApps = installedAppRepository.getOne(installAppVO.getId());
			installedApps.setModifiedOn(timestamp);
			installedApps.setModifiedBy(YorosisContext.get().getUserName());
			if (StringUtils.equalsIgnoreCase(installAppVO.getInstall(), "N")) {
				installedApps.setActiveFlag(YoroappsConstants.NO);
				YorosisContext currentContext = YorosisContext.get();
				try {
					YorosisContext.clear();
					YorosisContext context = YorosisContext.builder().tenantId(YoroappsConstants.DEFAULT_SCHEMA).build();
					YorosisContext.set(context);
					marketPlaceService.setUninstalledCounts(installAppVO.getProcessDefinitionName());
				} finally {
					YorosisContext.clear();
					YorosisContext.set(currentContext);
				}
				response = "Application Uninstalled Successfully";
			} else if (StringUtils.equalsIgnoreCase(installAppVO.getInstall(), "Y")) {
				YorosisContext currentContext = YorosisContext.get();
				try {
					YorosisContext.clear();
					YorosisContext context = YorosisContext.builder().tenantId(YoroappsConstants.DEFAULT_SCHEMA).build();
					YorosisContext.set(context);
					responseVO = marketPlaceService.setInstalledCounts(installedApps.getProcessDefinitionName(), installAppVO.getInstallFrom());
				} finally {
					YorosisContext.clear();
					YorosisContext.set(currentContext);
				}
				response = "Application Installed Successfully";
			}
			installedAppRepository.save(installedApps);
		}
		if (responseVO != null) {
			jsonNode = responseVO.getData();
		}
		return ResponseStringVO.builder().response(response).data(jsonNode).build();
	}

	@Transactional
	public List<InstallAppVO> getInstalledApps() {
		List<InstallAppVO> installedAppsList = new ArrayList<>();
		for (InstalledApps installedApps : installedAppRepository.findByTenantIdAndActiveFlagIgnoreCase(YorosisContext.get().getTenantId(),
				YoroappsConstants.YES)) {
			InstallAppVO installAppVO = InstallAppVO.builder().id(installedApps.getId()).processDefinitionName(installedApps.getProcessDefinitionName())
					.startKey(installedApps.getStartKey()).install(installedApps.getActiveFlag()).description(installedApps.getDescription()).build();
			installedAppsList.add(installAppVO);
		}
		return installedAppsList;
	}
}
