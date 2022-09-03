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

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.base.Preconditions;
import com.yorosis.taskboard.models.TaskboardApplicationVO;
import com.yorosis.taskboard.repository.EventAutomationRepository;
import com.yorosis.taskboard.repository.OrganizationIntegratedAppsRepository;
import com.yorosis.taskboard.repository.TaskboardAppConfigRepository;
import com.yorosis.taskboard.repository.TaskboardApplicationRepository;
import com.yorosis.taskboard.services.outh.handler.OauthHandler;
import com.yorosis.taskboard.taskboard.entities.EventAutomation;
import com.yorosis.taskboard.taskboard.entities.OrganizationIntegratedApps;
import com.yorosis.taskboard.taskboard.entities.TaskboardApplication;
import com.yorosis.taskboard.taskboard.entities.TaskboardApplicationConfig;
import com.yorosis.yoroapps.vo.OauthToken;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.general.exception.YorosisException;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class TaskboardApplicationService {
	@Autowired
	private TaskboardApplicationRepository appConfigurationRepository;

	@Autowired
	private TaskboardAppConfigRepository taskboardAppConfigRepository;

	@Autowired
	private StringEncryptor jasyptEncryptor;

	@Autowired
	private EventAutomationRepository eventAutomationRepository;

	@Autowired
	private OrganizationIntegratedAppsRepository organizationIntegratedAppsRepository;

	@Autowired
	private ProxyYoroflowSchemaService proxyYoroflowSchemaService;

	private static final String TOKEN = "token";

	@Transactional
	public ResponseStringVO saveAppConfiguration(TaskboardApplicationVO appConfigurationVO) {
		TaskboardApplicationConfig taskboardApplicationConfig = null;
		List<EventAutomation> eventAutomtaions = eventAutomationRepository.getAutomationList(appConfigurationVO.getTaskboardId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (appConfigurationVO.getId() == null) {
			handleExistingAutomation(eventAutomtaions, YorosisConstants.YES, appConfigurationVO.getApplicationName());
		} else {
			taskboardApplicationConfig = taskboardAppConfigRepository.findByIdAndTenantIdAndActiveFlag(appConfigurationVO.getId(),
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (taskboardApplicationConfig != null) {
				taskboardApplicationConfig.setActiveFlag(YorosisConstants.NO);
				taskboardApplicationConfig.setModifiedBy(YorosisContext.get().getUserName());
				taskboardApplicationConfig.setModifiedOn(new Timestamp(System.currentTimeMillis()));
				taskboardAppConfigRepository.save(taskboardApplicationConfig);
				handleExistingAutomation(eventAutomtaions, YorosisConstants.NO, appConfigurationVO.getApplicationName());
			} else {
				return ResponseStringVO.builder().response("Invalid App Id").build();
			}
		}
		return ResponseStringVO.builder().response("Application configuration saved successfully").responseId(taskboardApplicationConfig.getId().toString())
				.build();
	}

	private void handleExistingAutomation(List<EventAutomation> eventAutomtaions, String ruleActive, String applicationName) {
		for (EventAutomation automation : eventAutomtaions) {
			if (automation.getAutomation().isArray()) {
				for (JsonNode objNode : automation.getAutomation()) {
					if (objNode.has("applications") && StringUtils.equals(objNode.get("applications").asText(), applicationName)) {
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

	private TaskboardApplicationVO constructTaskboardApplicationConfigDtoToVO(TaskboardApplicationConfig taskboardApplicationConfig) {
		return TaskboardApplicationVO.builder().applicationName(taskboardApplicationConfig.getOrganizationIntegratedApps().getAppName())
				.taskboardId(taskboardApplicationConfig.getTaskboardId()).id(taskboardApplicationConfig.getId()).build();
	}

	@Transactional
	public List<TaskboardApplicationVO> getTaskboardApplications(UUID taskboardId) {
		return taskboardAppConfigRepository.findByTaskboardIdAndTenantIdAndActiveFlag(taskboardId, YorosisContext.get().getTenantId(), YorosisConstants.YES)
				.stream().map(this::constructTaskboardApplicationConfigDtoToVO).collect(Collectors.toList());
	}

	@Transactional
	public ResponseStringVO getConfiguredAppsByAplicationName(String applicationName) {
		String response = null;
		String taskboardNames = null;
		List<TaskboardApplication> taskboardApplication = appConfigurationRepository.findByAppNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(applicationName,
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

	public List<TaskboardApplicationVO> saveTaskboardAppIntegration(final String authorizationCode, final UUID appId, final String tenantId,
			final UUID taskboardId) throws YorosisException {
		Preconditions.checkArgument(StringUtils.isNotBlank(authorizationCode), "Authorization " + "Code can't be blank");
		Preconditions.checkNotNull(appId, "App Id is required");
		Preconditions.checkArgument(StringUtils.isNotBlank(tenantId), "Tenant Id is required");
		proxyYoroflowSchemaService.setUpYoroContext(tenantId, authorizationCode, appId, taskboardId);
		return getTaskboardApplications(taskboardId);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void taskboardAppIntegration(final String authorizationCode, final UUID appId, final UUID taskboardId) throws YorosisException {
		OrganizationIntegratedApps selectedIntegratedApp = organizationIntegratedAppsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(appId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		OauthToken accessToken = getAccessToken(authorizationCode, selectedIntegratedApp);
		saveTaskboardAppConfig(accessToken, taskboardId, selectedIntegratedApp);
	}

	private void saveTaskboardAppConfig(final OauthToken accessToken, final UUID taskboardId, final OrganizationIntegratedApps selectedIntegratedApp) {
		TaskboardApplicationConfig taskboardApplicationConfig = null;
		TaskboardApplication taskboardApplication = appConfigurationRepository.getApplication(taskboardId, selectedIntegratedApp.getAppName(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		taskboardApplicationConfig = constructNewConfigDto();
		taskboardApplicationConfig.setTaskboardApplication(taskboardApplication);
		taskboardApplicationConfig = setAccessToken(taskboardApplicationConfig, accessToken);
		taskboardApplicationConfig.setModifiedOn(new Timestamp(System.currentTimeMillis()));
		taskboardApplicationConfig.setModifiedBy(YorosisContext.get().getUserName());
		taskboardApplicationConfig.setTaskboardId(taskboardId);
		taskboardApplicationConfig.setOrganizationIntegratedApps(selectedIntegratedApp);
		List<EventAutomation> eventAutomtaions = eventAutomationRepository.getAutomationList(taskboardId, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		handleExistingAutomation(eventAutomtaions, YorosisConstants.YES, selectedIntegratedApp.getAppName());
		taskboardAppConfigRepository.save(taskboardApplicationConfig);
	}

	private TaskboardApplicationConfig constructNewConfigDto() {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return TaskboardApplicationConfig.builder().createdOn(timestamp).createdBy(YorosisContext.get().getUserName()).activeFlag(YorosisConstants.YES)
				.tenantId(YorosisContext.get().getTenantId()).authType(TOKEN).build();
	}

	private TaskboardApplicationConfig setAccessToken(TaskboardApplicationConfig config, final OauthToken token) {
		config.setAccessToken(jasyptEncryptor.encrypt(token.getAccessToken()));
		config.setRefreshToken(jasyptEncryptor.encrypt(token.getRefreshToken()));
		return config;
	}

	private OauthToken getAccessToken(String authorizationCode, OrganizationIntegratedApps selectedIntegratedApp) throws YorosisException {
		OauthHandler oauthHandler = new OauthHandler(selectedIntegratedApp);
		return oauthHandler.exchangeAuthorizationCodeForToken(authorizationCode).orElseThrow(() -> new YorosisException("Failed to get token"));
	}
}
