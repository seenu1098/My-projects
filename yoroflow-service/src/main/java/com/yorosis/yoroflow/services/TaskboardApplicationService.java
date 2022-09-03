package com.yorosis.yoroflow.services;

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

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.base.Preconditions;
import com.yorosis.yoroapps.vo.OauthToken;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.entities.EventAutomation;
import com.yorosis.yoroflow.entities.OrganizationIntegratedApps;
import com.yorosis.yoroflow.entities.Taskboard;
import com.yorosis.yoroflow.entities.TaskboardApplication;
import com.yorosis.yoroflow.entities.TaskboardApplicationConfig;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.general.exception.YorosisException;
import com.yorosis.yoroflow.models.TaskboardApplicationVO;
import com.yorosis.yoroflow.repository.CustomersRepository;
import com.yorosis.yoroflow.repository.EventAutomationRepository;
import com.yorosis.yoroflow.repository.OrganizationIntegratedAppsRepository;
import com.yorosis.yoroflow.repository.TaskboardAppConfigRepository;
import com.yorosis.yoroflow.repository.TaskboardApplicationRepository;
import com.yorosis.yoroflow.repository.TaskboardRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.services.outh.handler.OauthHandler;

@Service
public class TaskboardApplicationService {
	@Autowired
	private TaskboardApplicationRepository appConfigurationRepository;

	@Autowired
	private TaskboardAppConfigRepository taskboardAppConfigRepository;

	@Autowired
	private TaskboardRepository taskboardRepository;

	@Autowired
	private StringEncryptor jasyptEncryptor;

	@Autowired
	private EventAutomationRepository eventAutomationRepository;

	@Autowired
	private CustomersRepository customersRepository;

	@Autowired
	private OrganizationIntegratedAppsRepository organizationIntegratedAppsRepository;

	@Autowired
	private ProxyYoroflowSchemaService proxyYoroflowSchemaService;

	private static final String API = "api";
	private static final String CLIENT = "client";
	private static final String TOKEN = "token";

	private TaskboardApplication constructVoToDto(TaskboardApplicationVO appConfigurationVO) {
		Taskboard taskboard = null;
		if (appConfigurationVO.getTaskboardId() != null) {
			taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
					appConfigurationVO.getTaskboardId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		}
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return TaskboardApplication.builder().taskboard(taskboard).createdBy(YorosisContext.get().getUserName())
				.createdOn(timestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.activeFlag(YorosisConstants.YES).tenantId(YorosisContext.get().getTenantId())
				.appName(appConfigurationVO.getApplicationName()).build();
	}

	private TaskboardApplicationConfig constructAppConfigDtoToVo(TaskboardApplicationVO appConfigurationVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		TaskboardApplicationConfig taskboardApplicationConfig = TaskboardApplicationConfig.builder()
				.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).activeFlag(YorosisConstants.YES)
				.tenantId(YorosisContext.get().getTenantId()).authType(appConfigurationVO.getAuthType()).build();
		if (StringUtils.equals(appConfigurationVO.getAuthType(), TOKEN)) {
			taskboardApplicationConfig.setAuthToken(jasyptEncryptor.encrypt(appConfigurationVO.getAuthToken()));
		} else if (StringUtils.equals(appConfigurationVO.getAuthType(), API)) {
			taskboardApplicationConfig.setApiKey(appConfigurationVO.getApiKey());
			taskboardApplicationConfig.setApiSecret(jasyptEncryptor.encrypt(appConfigurationVO.getApiSecret()));
		} else if (StringUtils.equals(appConfigurationVO.getAuthType(), CLIENT)) {
			taskboardApplicationConfig.setClientId(appConfigurationVO.getClientId());
			taskboardApplicationConfig.setClientSecret(jasyptEncryptor.encrypt(appConfigurationVO.getClientSecret()));
		}
		return taskboardApplicationConfig;
	}

//	@Transactional
//	public ResponseStringVO saveAppConfiguration(TaskboardApplicationVO appConfigurationVO) {
//		TaskboardApplication appConfig = null;
//		String response = null;
//		List<EventAutomation> eventAutomtaions = eventAutomationRepository.getAutomationList(
//				appConfigurationVO.getTaskboardId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
//		if (appConfigurationVO.getId() == null) {
//			appConfig = constructVoToDto(appConfigurationVO);
//			handleExistingAutomation(eventAutomtaions, YorosisConstants.YES, appConfigurationVO.getApplicationName());
//			response = "Application configuration saved successfully";
//		} else {
//			appConfig = appConfigurationRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
//					appConfigurationVO.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
//			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
//			appConfig.setModifiedBy(YorosisContext.get().getUserName());
//			appConfig.setModifiedOn(timestamp);
//			appConfig.setActiveFlag(YorosisConstants.NO);
//			handleExistingAutomation(eventAutomtaions, YorosisConstants.NO, appConfigurationVO.getApplicationName());
//		}
//		TaskboardApplication savedTaskboardApplication = appConfigurationRepository.save(appConfig);
////		if (appConfigurationVO.getAuthType() != null) {
////			TaskboardApplicationConfig taskboardApplicationConfig = taskboardAppConfigRepository
////					.getTaskboardApplicationConfigurations(savedTaskboardApplication.getId(),
////							YorosisContext.get().getTenantId(), YorosisConstants.YES);
////			if (taskboardApplicationConfig == null) {
////				taskboardApplicationConfig = constructAppConfigDtoToVo(appConfigurationVO);
////				taskboardApplicationConfig.setTaskboardApplication(savedTaskboardApplication);
////			} else {
////				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
////				taskboardApplicationConfig.setActiveFlag(YorosisConstants.YES);
////				taskboardApplicationConfig.setModifiedBy(YorosisContext.get().getUserName());
////				taskboardApplicationConfig.setModifiedOn(timestamp);
////				taskboardApplicationConfig.setAuthType(appConfigurationVO.getAuthType());
////				if (StringUtils.equals(appConfigurationVO.getAuthType(), TOKEN)) {
////					taskboardApplicationConfig.setAuthToken(jasyptEncryptor.encrypt(appConfigurationVO.getAuthToken()));
////					taskboardApplicationConfig.setApiKey(null);
////					taskboardApplicationConfig.setApiSecret(null);
////					taskboardApplicationConfig.setClientId(null);
////					taskboardApplicationConfig.setClientSecret(null);
////				} else if (StringUtils.equals(appConfigurationVO.getAuthType(), API)) {
////					taskboardApplicationConfig.setApiKey(appConfigurationVO.getApiKey());
////					taskboardApplicationConfig.setApiSecret(jasyptEncryptor.encrypt(appConfigurationVO.getApiSecret()));
////					taskboardApplicationConfig.setClientId(null);
////					taskboardApplicationConfig.setClientSecret(null);
////					taskboardApplicationConfig.setAuthToken(null);
////				} else if (StringUtils.equals(appConfigurationVO.getAuthType(), CLIENT)) {
////					taskboardApplicationConfig.setClientId(appConfigurationVO.getClientId());
////					taskboardApplicationConfig
////							.setClientSecret(jasyptEncryptor.encrypt(appConfigurationVO.getClientSecret()));
////					taskboardApplicationConfig.setApiKey(null);
////					taskboardApplicationConfig.setApiSecret(null);
////					taskboardApplicationConfig.setAuthToken(null);
////				}
////			}
////			taskboardAppConfigRepository.save(taskboardApplicationConfig);
////		}
//		return ResponseStringVO.builder().response(response).responseId(savedTaskboardApplication.getId().toString())
//				.build();
//	}

	@Transactional
	public ResponseStringVO saveAppConfiguration(TaskboardApplicationVO appConfigurationVO) {
		TaskboardApplicationConfig taskboardApplicationConfig = null;
		List<EventAutomation> eventAutomtaions = eventAutomationRepository.getAutomationList(
				appConfigurationVO.getTaskboardId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (appConfigurationVO.getId() == null) {
//			taskboardApplicationConfig = constructVoToDto(appConfigurationVO);
			handleExistingAutomation(eventAutomtaions, YorosisConstants.YES, appConfigurationVO.getApplicationName());
//			taskboardAppConfigRepository.save(taskboardApplicationConfig);
		} else {
			taskboardApplicationConfig = taskboardAppConfigRepository.findByIdAndTenantIdAndActiveFlag(
					appConfigurationVO.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (taskboardApplicationConfig != null) {
				taskboardApplicationConfig.setActiveFlag(YorosisConstants.NO);
				taskboardApplicationConfig.setModifiedBy(YorosisContext.get().getUserName());
				taskboardApplicationConfig.setModifiedOn(new Timestamp(System.currentTimeMillis()));
				taskboardAppConfigRepository.save(taskboardApplicationConfig);
				handleExistingAutomation(eventAutomtaions, YorosisConstants.NO,
						appConfigurationVO.getApplicationName());
			} else {
				return ResponseStringVO.builder().response("Invalid App Id").build();
			}
		}
		return ResponseStringVO.builder().response("Application configuration saved successfully")
				.responseId(taskboardApplicationConfig.getId().toString()).build();
	}

	private void handleExistingAutomation(List<EventAutomation> eventAutomtaions, String ruleActive,
			String applicationName) {
		for (EventAutomation automation : eventAutomtaions) {
			if (automation.getAutomation().isArray()) {
				for (JsonNode objNode : automation.getAutomation()) {
					if (objNode.has("applications")
							&& StringUtils.equals(objNode.get("applications").asText(), applicationName)) {
						Timestamp timestamp = new Timestamp(System.currentTimeMillis());
						automation.setRuleActive(ruleActive);
						automation.setModifiedBy(YorosisContext.get().getUserName());
						automation.setModifiedOn(timestamp);
						eventAutomationRepository.save(automation);
					}
				}
			}

		}
	}

	private TaskboardApplicationVO constructConfigDtoToVO(TaskboardApplication appConfig) {
		TaskboardApplicationVO appConfigurationVO = TaskboardApplicationVO.builder().build();
		appConfig.getTaskboardApplicationConfig().stream()
				.filter(app -> StringUtils.equals(app.getActiveFlag(), YorosisConstants.YES));
		if (appConfig.getTaskboardApplicationConfig() != null && !appConfig.getTaskboardApplicationConfig().isEmpty()) {
			TaskboardApplicationConfig taskboardApplicationConfigs = appConfig.getTaskboardApplicationConfig().get(0);
			String apiSecret = jasyptEncryptor.decrypt(taskboardApplicationConfigs.getApiSecret());
			String clientSecret = jasyptEncryptor.decrypt(taskboardApplicationConfigs.getClientSecret());
			String token = jasyptEncryptor.decrypt(taskboardApplicationConfigs.getAuthToken());
			appConfigurationVO = TaskboardApplicationVO.builder().apiKey(taskboardApplicationConfigs.getApiKey())
					.authType(taskboardApplicationConfigs.getAuthType())
					.clientId(taskboardApplicationConfigs.getClientId()).build();
			if (apiSecret != null) {
				appConfigurationVO.setApiSecret(new StringBuilder(apiSecret)
						.replace(4, apiSecret.length(), new String(new char[apiSecret.length() - 4]).replace("\0", "x"))
						.toString());
			} else if (clientSecret != null) {
				appConfigurationVO.setClientSecret(new StringBuilder(clientSecret).replace(4, clientSecret.length(),
						new String(new char[clientSecret.length() - 4]).replace("\0", "x")).toString());
			} else if (token != null) {
				appConfigurationVO.setAuthToken(new StringBuilder(token)
						.replace(4, token.length(), new String(new char[token.length() - 4]).replace("\0", "x"))
						.toString());
			}

		}
		appConfigurationVO.setId(appConfig.getId());
		appConfigurationVO.setApplicationName(appConfig.getAppName());
		appConfigurationVO.setTaskboardId(appConfig.getTaskboard().getId());
		return appConfigurationVO;
	}

	private TaskboardApplicationVO constructTaskboardApplicationConfigDtoToVO(
			TaskboardApplicationConfig taskboardApplicationConfig) {
		return TaskboardApplicationVO.builder()
				.applicationName(taskboardApplicationConfig.getOrganizationIntegratedApps().getAppName())
				.taskboardId(taskboardApplicationConfig.getTaskboardId()).id(taskboardApplicationConfig.getId())
				.build();
	}

	@Transactional
	public List<TaskboardApplicationVO> getTaskboardApplications(UUID taskboardId) {
		List<TaskboardApplicationVO> appConfigurationVO = taskboardAppConfigRepository
				.findByTaskboardIdAndTenantIdAndActiveFlag(taskboardId, YorosisContext.get().getTenantId(),
						YorosisConstants.YES)
				.stream().map(this::constructTaskboardApplicationConfigDtoToVO).collect(Collectors.toList());
		return appConfigurationVO;
	}

//	@Transactional
//	public List<TaskboardApplicationVO> getConfiguredApplications(UUID taskboardId) {
//		Taskboard taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardId,
//				YorosisContext.get().getTenantId(), YorosisConstants.YES);
//		List<TaskboardApplicationVO> appConfigurationVO = appConfigurationRepository
//				.findByTaskboardAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboard,
//						YorosisContext.get().getTenantId(), YorosisConstants.YES)
//				.stream().map(this::constructConfigDtoToVO).collect(Collectors.toList());
//		return appConfigurationVO;
//	}

	@Transactional
	public ResponseStringVO getConfiguredAppsByAplicationName(String applicationName) {
		String response = null;
		String taskboardNames = null;
		List<TaskboardApplication> taskboardApplication = appConfigurationRepository
				.findByAppNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(applicationName,
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardApplication != null && !taskboardApplication.isEmpty()) {
			response = "application already used";
			for (TaskboardApplication taskboardApp : taskboardApplication) {
				if (taskboardNames == null) {
					taskboardNames = taskboardApp.getTaskboard().getName();
				} else {
					taskboardNames = taskboardNames + " ," + taskboardApp.getTaskboard().getName();
				}
			}
		} else {
			response = "application not used";
		}
		return ResponseStringVO.builder().response(response).responseId(taskboardNames).build();
	}

	public List<TaskboardApplicationVO> saveTaskboardAppIntegration(final String authorizationCode, final UUID appId,
			final String tenantId, final UUID taskboardId) throws YorosisException {
		Preconditions.checkArgument(StringUtils.isNotBlank(authorizationCode),
				"Authorization " + "Code can't be blank");
		Preconditions.checkNotNull(appId, "App Id is required");
		Preconditions.checkArgument(StringUtils.isNotBlank(tenantId), "Tenant Id is required");
		proxyYoroflowSchemaService.setUpYoroContext(tenantId, authorizationCode, appId, taskboardId);
		return getTaskboardApplications(taskboardId);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void taskboardAppIntegration(final String authorizationCode, final UUID appId, final UUID taskboardId)
			throws YorosisException {
		OrganizationIntegratedApps selectedIntegratedApp = organizationIntegratedAppsRepository
				.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(appId, YorosisContext.get().getTenantId(),
						YorosisConstants.YES);
		OauthToken accessToken = getAccessToken(authorizationCode, selectedIntegratedApp);
		saveTaskboardAppConfig(accessToken, taskboardId, selectedIntegratedApp);
	}

	private void saveTaskboardAppConfig(final OauthToken accessToken, final UUID taskboardId,
			final OrganizationIntegratedApps selectedIntegratedApp) {
		TaskboardApplicationConfig taskboardApplicationConfig = null;
		TaskboardApplication taskboardApplication = appConfigurationRepository.getApplication(taskboardId,
				selectedIntegratedApp.getAppName(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
//		if (taskboardApplication == null) {
		taskboardApplicationConfig = constructNewConfigDto();
		taskboardApplicationConfig.setTaskboardApplication(taskboardApplication);
		taskboardApplicationConfig = setAccessToken(taskboardApplicationConfig, accessToken);
		taskboardApplicationConfig.setModifiedOn(new Timestamp(System.currentTimeMillis()));
		taskboardApplicationConfig.setModifiedBy(YorosisContext.get().getUserName());
		taskboardApplicationConfig.setTaskboardId(taskboardId);
		taskboardApplicationConfig.setOrganizationIntegratedApps(selectedIntegratedApp);
		List<EventAutomation> eventAutomtaions = eventAutomationRepository.getAutomationList(taskboardId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		handleExistingAutomation(eventAutomtaions, YorosisConstants.YES, selectedIntegratedApp.getAppName());
		taskboardAppConfigRepository.save(taskboardApplicationConfig);
//		}
	}

	private TaskboardApplicationConfig constructNewConfigDto() {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return TaskboardApplicationConfig.builder().createdOn(timestamp).createdBy(YorosisContext.get().getUserName())
				.activeFlag(YorosisConstants.YES).tenantId(YorosisContext.get().getTenantId()).authType(TOKEN).build();
	}

	private TaskboardApplicationConfig setAccessToken(TaskboardApplicationConfig config, final OauthToken token) {
		config.setAccessToken(jasyptEncryptor.encrypt(token.getAccessToken()));
		config.setRefreshToken(jasyptEncryptor.encrypt(token.getRefreshToken()));
		return config;
	}

	private OauthToken getAccessToken(String authorizationCode, OrganizationIntegratedApps selectedIntegratedApp)
			throws YorosisException {
		OauthHandler oauthHandler = new OauthHandler(selectedIntegratedApp);
		return oauthHandler.exchangeAuthorizationCodeForToken(authorizationCode)
				.orElseThrow(() -> new YorosisException("Failed to get token"));
	}
}
