package com.yorosis.taskboard.services;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.taskboard.models.EventAutomationCategoryVO;
import com.yorosis.taskboard.models.EventAutomationConfigurationVO;
import com.yorosis.taskboard.models.EventAutomationVO;
import com.yorosis.taskboard.models.FieldVO;
import com.yorosis.taskboard.models.ResponseStringVO;
import com.yorosis.taskboard.repository.EventAutomationCategoriesRepository;
import com.yorosis.taskboard.repository.EventAutomationConfigurationRepository;
import com.yorosis.taskboard.repository.EventAutomationRepository;
import com.yorosis.taskboard.repository.TaskboardAppConfigRepository;
import com.yorosis.taskboard.repository.TaskboardColumnsRepository;
import com.yorosis.taskboard.repository.TaskboardRepository;
import com.yorosis.taskboard.services.clients.YoroappsServiceClient;
import com.yorosis.taskboard.services.variables.SystemVariableService;
import com.yorosis.taskboard.taskboard.entities.EventAutomation;
import com.yorosis.taskboard.taskboard.entities.EventAutomationCategories;
import com.yorosis.taskboard.taskboard.entities.EventAutomationConfig;
import com.yorosis.taskboard.taskboard.entities.Taskboard;
import com.yorosis.taskboard.taskboard.entities.TaskboardApplicationConfig;
import com.yorosis.taskboard.taskboard.entities.TaskboardColumns;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class EventAutomationService {

	@Autowired
	private EventAutomationConfigurationRepository eventAutomationConfigurationRepository;

	@Autowired
	private EventAutomationRepository eventAutomationRepository;

	@Autowired
	private EventAutomationCategoriesRepository eventAutomationCategoriesRepository;

	@Autowired
	private TaskboardRepository taskboardRepository;

	@Autowired
	private YoroappsServiceClient yoroappsServiceClient;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private SystemVariableService systemVariableService;

	@Autowired
	private TaskboardAppConfigRepository taskboardAppConfigRepository;

	@Autowired
	private TaskboardColumnsRepository taskboardColumnsRepository;

	private EventAutomation constructVOtoDto(EventAutomationVO eventAutomationVO) throws JsonProcessingException {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		JsonNode automationJson = mapper.readTree(mapper.writeValueAsString(eventAutomationVO.getAutomation()));
		Taskboard taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(eventAutomationVO.getTaskboardId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		return EventAutomation.builder().taskboard(taskboard).automation(automationJson).ruleActive(eventAutomationVO.getIsRuleActive()).createdOn(timestamp)
				.createdBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).automationType(eventAutomationVO.getAutomationType())
				.modifiedBy(YorosisContext.get().getUserName()).tenantId(YorosisContext.get().getTenantId()).activeFlag(YorosisConstants.YES).build();
	}

	private EventAutomationVO constructAutomationDtotoVO(EventAutomation eventAutomation) {
		return EventAutomationVO.builder().id(eventAutomation.getId()).taskboardId(eventAutomation.getTaskboard().getId())
				.automation(eventAutomation.getAutomation()).isRuleActive(eventAutomation.getRuleActive()).automationType(eventAutomation.getAutomationType())
				.build();
	}

	private EventAutomationConfigurationVO contructAutomationConfigurationVOtoDto(EventAutomationConfig eventAutomationConfig) {
		return EventAutomationConfigurationVO.builder().id(eventAutomationConfig.getId()).automation(eventAutomationConfig.getAutomation())
				.parentId(eventAutomationConfig.getParentAutomationId()).automationType(eventAutomationConfig.getAutomationType())
				.category(eventAutomationConfig.getCategory()).automationSubType(eventAutomationConfig.getAutomationSubtype()).build();
	}

	private EventAutomationCategoryVO contructCategoryDtotoVO(EventAutomationCategories automationCategories) {
		return EventAutomationCategoryVO.builder().automation(automationCategories.getAutomation()).categoryName(automationCategories.getCategoryName())
				.applicationName(automationCategories.getAppName()).build();
	}

	@Transactional
	public List<String> getApplicationsList(UUID taskboardId) {
		List<String> appList = new ArrayList<>();
		Taskboard taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(taskboardId, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		if (taskboard != null) {
			List<TaskboardApplicationConfig> taskboardApplicationConfig = taskboardAppConfigRepository
					.findByTaskboardIdAndTenantIdAndActiveFlag(taskboard.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (taskboardApplicationConfig != null && !taskboardApplicationConfig.isEmpty()) {
				taskboardApplicationConfig.stream().filter(app -> StringUtils.equals(app.getActiveFlag(), YorosisConstants.YES))
						.forEach(app -> appList.add(app.getOrganizationIntegratedApps().getAppName()));
			}
		}
//		if (taskboard.getAppConfig() != null && !taskboard.getAppConfig().isEmpty()) {
//			taskboard.getAppConfig().stream()
//					.filter(app -> StringUtils.equals(app.getActiveFlag(), YorosisConstants.YES))
//					.forEach(app -> appList.add(app.getAppName()));
//		}
		return appList;
	}

	@Transactional
	public List<EventAutomationConfigurationVO> getAutomationConfigurationList(List<String> applicationsList) {
		List<EventAutomationConfig> automation = eventAutomationConfigurationRepository.getAutomationConfigurationList(YorosisContext.get().getTenantId(),
				YorosisConstants.YES, applicationsList);
		List<EventAutomationConfigurationVO> automationList = automation.stream().map(this::contructAutomationConfigurationVOtoDto)
				.collect(Collectors.toList());
		return automationList;
	}

	@Transactional
	public ResponseStringVO saveAutomation(EventAutomationVO eventAutomationVO) throws JsonProcessingException {
		String response = null;
		if (eventAutomationVO.getId() == null) {
			EventAutomation eventAutomation = constructVOtoDto(eventAutomationVO);
			eventAutomationRepository.save(eventAutomation);
			response = "Event automation saved successfully";
		} else {
			Timestamp timestamp = new Timestamp(System.currentTimeMillis());
			EventAutomation eventAutomation = eventAutomationRepository.getOne(eventAutomationVO.getId());

			JsonNode automationJson = mapper.readTree(mapper.writeValueAsString(eventAutomationVO.getAutomation()));
			eventAutomation.setAutomation(automationJson);
			eventAutomation.setAutomationType(eventAutomationVO.getAutomationType());
			eventAutomation.setRuleActive(eventAutomationVO.getIsRuleActive());
			eventAutomation.setCreatedOn(timestamp);
			eventAutomation.setModifiedOn(timestamp);
			eventAutomation.setActiveFlag(YorosisConstants.YES);
			eventAutomationRepository.save(eventAutomation);
			response = "Event automation updated successfully";
		}
		return ResponseStringVO.builder().response(response).build();
	}

	@Transactional
	public List<EventAutomationVO> getAutomationList(String taskboardId) {
		List<EventAutomation> eveAutomationList = eventAutomationRepository.getAutomationList(UUID.fromString(taskboardId), YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		return eveAutomationList.stream().map(this::constructAutomationDtotoVO).collect(Collectors.toList());
	}

	@Transactional
	public ResponseStringVO setRuleActive(EventAutomationVO automationVO) {
		EventAutomation eventAutomation = eventAutomationRepository.getOne(automationVO.getId());
		eventAutomation.setRuleActive(automationVO.getIsRuleActive());
		eventAutomationRepository.save(eventAutomation);
		return ResponseStringVO.builder().response("Rule active updated successfully").build();
	}

	@Transactional
	public ResponseStringVO deleteAutomation(EventAutomationVO automationVO) {
		EventAutomation eventAutomation = eventAutomationRepository.getOne(automationVO.getId());
		eventAutomation.setActiveFlag(YorosisConstants.NO);
		eventAutomationRepository.save(eventAutomation);
		return ResponseStringVO.builder().response("Rule active updated successfully").build();
	}

	@Transactional
	public List<EventAutomationCategoryVO> getAutomationsByCategory(List<String> applicationsList) {
		return eventAutomationCategoriesRepository.getAutomationsByCategories(YorosisContext.get().getTenantId(), YorosisConstants.YES, applicationsList)
				.stream().map(this::contructCategoryDtotoVO).collect(Collectors.toList());
	}

	@Transactional
	public ResponseStringVO saveAllAutomations(List<EventAutomationVO> eventAutomations) throws JsonProcessingException {
		List<EventAutomation> eventAutomationList = new ArrayList<>();
		for (EventAutomationVO eventAutomationVO : eventAutomations) {
			eventAutomationList.add(constructVOtoDto(eventAutomationVO));
		}
		eventAutomationRepository.saveAll(eventAutomationList);
		return ResponseStringVO.builder().response("Automations saved successfully").build();
	}

	@Transactional
	public Map<String, List<FieldVO>> getPageFields(UUID taskboardId) {
		Map<String, List<FieldVO>> fieldList = new LinkedHashMap<>();
		List<TaskboardColumns> columnsList = taskboardColumnsRepository.getFirstTaskboardColumn(YorosisContext.get().getTenantId(), YorosisConstants.YES,
				taskboardId, PageRequest.of(0, 1));
		if (columnsList != null && !columnsList.isEmpty()) {
			fieldList = getPageFieldValue(columnsList.get(0).getFormId(), columnsList.get(0).getVersion());
		}
		return fieldList;
	}

	private Map<String, List<FieldVO>> getPageFieldValue(String formId, Long version) {
		return yoroappsServiceClient.getFieldValues(YorosisContext.get().getToken(), formId, version);
	}

	@Transactional
	public Map<String, List<FieldVO>> getPageFieldVo(String formId, Long version) {
		Map<String, List<FieldVO>> fieldList = getPageFieldValue(formId, version);
		List<FieldVO> systemVariableFieldList = systemVariableService.getNonUserFieldList();
		if (!CollectionUtils.isEmpty(systemVariableFieldList)) {
			fieldList.put("System Variables:", systemVariableFieldList);
		}

		return fieldList;
	}

}
