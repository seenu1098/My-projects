package com.yorosis.taskboard.services;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.common.base.Preconditions;
import com.yorosis.taskboard.models.OrganizationIntegratedAppsVO;
import com.yorosis.taskboard.models.ResponseStringVO;
import com.yorosis.taskboard.repository.OrgIntegratedAppsConfigRepository;
import com.yorosis.taskboard.repository.OrganizationIntegratedAppsRepository;
import com.yorosis.taskboard.repository.YoroflowSettingsRepository;
import com.yorosis.taskboard.services.outh.handler.OauthHandler;
import com.yorosis.taskboard.taskboard.entities.OrganizationIntegratedApps;
import com.yorosis.taskboard.taskboard.entities.OrganizationIntegratedAppsConfig;
import com.yorosis.yoroapps.vo.OauthToken;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.general.exception.YorosisException;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class OrganizationIntegratedAppsService {
	@Autowired
	private OrganizationIntegratedAppsRepository organizationIntegratedAppsRepository;

	@Autowired
	private OrgIntegratedAppsConfigRepository orgAppsConfigRepository;

	@Autowired
	private StringEncryptor jasyptEncryptor;

	@Autowired
	private YoroflowSettingsRepository yoroflowSettingsRepository;

	@Transactional()
	public List<OrganizationIntegratedAppsVO> saveAppIntegration(final String authorizationCode, final UUID appId) throws YorosisException {
		Preconditions.checkArgument(StringUtils.isNotBlank(authorizationCode), "Authorization " + "Code can't be blank");
		Preconditions.checkNotNull(appId, "App Id is required");
		OrganizationIntegratedApps selectedIntegratedApp = organizationIntegratedAppsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(appId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		OauthToken accessToken = getAccessToken(authorizationCode, selectedIntegratedApp);
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		selectedIntegratedApp.setIsRemoved(YorosisConstants.NO);
		selectedIntegratedApp.setModifiedBy(YorosisContext.get().getUserName());
		selectedIntegratedApp.setModifiedOn(timestamp);
		OrganizationIntegratedApps savedOrgApp = organizationIntegratedAppsRepository.save(selectedIntegratedApp);
		saveOrgAppIntegrationConfig(savedOrgApp, accessToken);
		return getApplications();
	}

	private void saveOrgAppIntegrationConfig(final OrganizationIntegratedApps savedOrgApp, final OauthToken accessToken) {
		OrganizationIntegratedAppsConfig orgIntegratedAppsConfig = orgAppsConfigRepository.getOrgAppsConfigByParentId(savedOrgApp.getId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (orgIntegratedAppsConfig == null) {
			orgIntegratedAppsConfig = constructNewConfigDto();
			orgIntegratedAppsConfig.setOrganizationIntegratedApps(savedOrgApp);
		} else {
			orgIntegratedAppsConfig.setActiveFlag(YorosisConstants.YES);
		}
		orgIntegratedAppsConfig = setAccessToken(orgIntegratedAppsConfig, accessToken);
		orgIntegratedAppsConfig.setModifiedOn(new Timestamp(System.currentTimeMillis()));
		orgIntegratedAppsConfig.setModifiedBy(YorosisContext.get().getUserName());
		orgAppsConfigRepository.save(orgIntegratedAppsConfig);
	}

	private OrganizationIntegratedAppsConfig constructNewConfigDto() {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return OrganizationIntegratedAppsConfig.builder().createdOn(timestamp).createdBy(YorosisContext.get().getUserName()).activeFlag(YorosisConstants.YES)
				.tenantId(YorosisContext.get().getTenantId()).build();
	}

	private OrganizationIntegratedAppsConfig setAccessToken(OrganizationIntegratedAppsConfig config, final OauthToken token) {
		config.setAccessToken(jasyptEncryptor.encrypt(token.getAccessToken()));
		config.setRefreshToken(jasyptEncryptor.encrypt(token.getRefreshToken()));
		return config;
	}

	private OauthToken getAccessToken(String authorizationCode, OrganizationIntegratedApps selectedIntegratedApp) throws YorosisException {
		OauthHandler oauthHandler = new OauthHandler(selectedIntegratedApp);
		return oauthHandler.exchangeAuthorizationCodeForToken(authorizationCode).orElseThrow(() -> new YorosisException("Failed to get token"));
	}

	private OrganizationIntegratedAppsVO constructApplicationDtoToVo(OrganizationIntegratedApps organizationIntegratedApps) {
		OrganizationIntegratedAppsVO orgAppsVO = OrganizationIntegratedAppsVO.builder().build();

		orgAppsVO.setId(organizationIntegratedApps.getId());
		orgAppsVO.setApplicationName(organizationIntegratedApps.getAppName());
		orgAppsVO.setIsRemoved(organizationIntegratedApps.getIsRemoved());
		orgAppsVO.setAuthorizationUrl(organizationIntegratedApps.getAuthorizationEndpoint());
		orgAppsVO.setRedirectUrl(organizationIntegratedApps.getRedirectUrl());
		orgAppsVO.setScopes(organizationIntegratedApps.getScopesCsv());
		orgAppsVO.setIssuer(organizationIntegratedApps.getIssuer());
		orgAppsVO.setClientId(organizationIntegratedApps.getClientId());
		orgAppsVO.setDescription(organizationIntegratedApps.getDescription());
		return orgAppsVO;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public List<OrganizationIntegratedAppsVO> getApplications() {
		return organizationIntegratedAppsRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getTenantId(), YorosisConstants.YES)
				.stream().map(this::constructApplicationDtoToVo).collect(Collectors.toList());
	}

	@Transactional
	public ResponseStringVO removeApplication(UUID applicationId) {
		String response = null;
		OrganizationIntegratedApps integratedApps = organizationIntegratedAppsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(applicationId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (integratedApps != null) {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			integratedApps.setIsRemoved(YorosisConstants.YES);
			integratedApps.setModifiedBy(YorosisContext.get().getUserName());
			integratedApps.setModifiedOn(timestamp);
			organizationIntegratedAppsRepository.save(integratedApps);
			removeAppConfig(applicationId);
			response = "Application removed successfully";
		} else {
			response = "Application does not exist";
		}
		return ResponseStringVO.builder().response(response).build();
	}

	private void removeAppConfig(UUID applicationId) {
		OrganizationIntegratedAppsConfig organizationIntegratedAppsConfig = orgAppsConfigRepository.getOrgAppsConfigByParentId(applicationId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (organizationIntegratedAppsConfig != null) {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			organizationIntegratedAppsConfig.setActiveFlag(YorosisConstants.NO);
			organizationIntegratedAppsConfig.setModifiedBy(YorosisContext.get().getUserName());
			organizationIntegratedAppsConfig.setModifiedOn(timestamp);
			orgAppsConfigRepository.save(organizationIntegratedAppsConfig);
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO getOauthUrl() {
		return ResponseStringVO.builder().response(yoroflowSettingsRepository.getOauthUrl()).build();
	}

}
