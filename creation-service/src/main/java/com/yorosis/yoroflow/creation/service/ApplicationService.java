package com.yorosis.yoroflow.creation.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.Application;
import com.yorosis.yoroapps.vo.ApplicationVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.ApplicationRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class ApplicationService {

	private static final String APPLICATION_ID = "Yoroflow-App";

	@Autowired
	private ApplicationRepository applicationRepository;

	@Autowired
	private FileManagerService fileManagerService;

	private ApplicationVO constructApplicationDTOToVO(Application application) throws IOException {
		String logo = null;
		if (StringUtils.isNotBlank(application.getLogo())) {
			logo = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(fileManagerService.downloadFile(application.getLogo()));
		}

		return ApplicationVO.builder().id(application.getId()).applicationName(application.getAppName()).description(application.getDescription())
				.defaultLanguage(application.getDefaultLanguge()).applicationId(application.getApplicationId()).timezone(application.getTimezone())
				.themeId(application.getThemeId()).logo(logo).build();
	}

	private ApplicationVO constructApplicationsDTOToVO(Application application) throws IOException {

		return ApplicationVO.builder().id(application.getId()).applicationName(application.getAppName()).appPrefix(application.getAppPrefix()).build();
	}

	public ResponseStringVO checkApplicationAlreadyExist(String applicationId) {
		Application app = applicationRepository.findByApplicationIdIgnoreCaseAndActiveFlagIgnoreCaseAndTenantIdIgnoreCaseAndManagedFlagIgnoreCase(applicationId,
				YoroappsConstants.YES, YorosisContext.get().getTenantId(), YoroappsConstants.NO);
		if (app != null) {
			return ResponseStringVO.builder().response("App already exist").build();
		} else {
			return ResponseStringVO.builder().response("App does not exist").build();
		}
	}

	@Transactional
	public List<ApplicationVO> getApplicationsList(UUID workspaceId) throws IOException {
		List<ApplicationVO> applicationVoList = new ArrayList<>();
		List<Application> applicationList = applicationRepository.getApplicationTenantIdAndActiveFlagAndManagedFlagIgnoreCase(YorosisContext.get().getTenantId(),
				YoroappsConstants.YES, YoroappsConstants.NO, workspaceId);
		for (Application application : applicationList) {
			applicationVoList.add(constructApplicationDTOToVO(application));
		}

		return applicationVoList;
	}

	@Transactional
	public List<ApplicationVO> getApplicationNameList(UUID workspaceId) throws IOException {
		List<ApplicationVO> applicationVoList = new ArrayList<>();
		List<Application> applicationList = applicationRepository.getApplicationTenantIdAndActiveFlagAndManagedFlagIgnoreCase(YorosisContext.get().getTenantId(),
				YoroappsConstants.YES, YoroappsConstants.NO, workspaceId);
		for (Application application : applicationList) {
			applicationVoList.add(constructApplicationsDTOToVO(application));
		}
		return applicationVoList;
	}

	@Transactional
	public String getApplicationPrefix(UUID applicationId) {
		Application application = applicationRepository.findByIdAndActiveFlagIgnoreCaseAndTenantIdAndManagedFlagIgnoreCase(applicationId, YoroappsConstants.YES,
				YorosisContext.get().getTenantId(), YoroappsConstants.NO);
		if (application != null && application.getAppPrefix() != null) {
			return application.getAppPrefix();
		}
		return null;
	}

	@Transactional
	public Application getApplication() {
		return applicationRepository.findByApplicationIdIgnoreCaseAndActiveFlagIgnoreCaseAndTenantIdIgnoreCaseAndManagedFlagIgnoreCase(APPLICATION_ID,
				YoroappsConstants.YES, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
	}
}
