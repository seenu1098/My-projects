package com.yorosis.yoroflow.creation.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroapps.entities.OrganizationSettings;
import com.yorosis.yoroapps.vo.EmailSettingsDataVO;
import com.yorosis.yoroapps.vo.EmailSettingsVO;
import com.yorosis.yoroapps.vo.EmailSettingsVOList;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.OrganizationSettingRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class OrganizationEmailSettingService {

	@Autowired
	private OrganizationSettingRepository organizationSettingRepository;

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private StringEncryptor jasyptEncryptor;

	private OrganizationSettings construcVOtoDTO(EmailSettingsVO emailSettingsVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return OrganizationSettings.builder().settingName(emailSettingsVO.getSettingName()).settingType("Email")
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
				.tenantId(YorosisContext.get().getTenantId()).activeFlag(YoroappsConstants.YES)
				.settingData(constructJsonNode(emailSettingsVO.getSettingData())).build();
	}

	private JsonNode constructJsonNode(EmailSettingsDataVO settingData) {
		settingData.setPassword(
				(settingData.getPassword() != null) ? jasyptEncryptor.encrypt(settingData.getPassword()) : null);
		JsonNode node = mapper.convertValue(settingData, JsonNode.class);
		return node;
	}

	private EmailSettingsDataVO getEmailDataVO(OrganizationSettings organizationSettings)
			throws JsonProcessingException {
		return mapper.treeToValue(organizationSettings.getSettingData(), EmailSettingsDataVO.class);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO saveOrgEmailSetting(EmailSettingsVOList emailSettingsVOList) {
		deleteVariableList(emailSettingsVOList.getDeletedEmailSettingIdList());
		if (emailSettingsVOList.getOrgEmailsettingsArray() != null) {
			List<OrganizationSettings> organizationList = new ArrayList<OrganizationSettings>();
			emailSettingsVOList.getOrgEmailsettingsArray().stream().forEach(emailVo -> {
				if (emailVo.getId() == null) {
					organizationList.add(construcVOtoDTO(emailVo));
				} else {
					OrganizationSettings organizationSettings = organizationSettingRepository
							.getBasedonIdAndTenantIdAndActiveFlag(emailVo.getId(), YorosisContext.get().getTenantId(),
									YoroappsConstants.YES);
					Timestamp timestamp = new Timestamp(System.currentTimeMillis());
					organizationSettings.setModifiedBy(YorosisContext.get().getUserName());
					organizationSettings.setModifiedOn(timestamp);
					organizationSettings.setSettingName(emailVo.getSettingName());
					organizationSettings.setSettingData(constructJsonNode(emailVo.getSettingData()));
					organizationList.add(organizationSettings);
				}
			});
			if (!organizationList.isEmpty()) {
				organizationSettingRepository.saveAll(organizationList);
			}
		}
		return ResponseStringVO.builder().build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public EmailSettingsVOList getEmailSettings() {
		List<EmailSettingsVO> emailSettingsVOList = new ArrayList<>();
		List<OrganizationSettings> organizationList = organizationSettingRepository
				.getListTenantIdAndActiveFlag(YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (organizationList != null) {
			emailSettingsVOList = loadEmailSettingList(organizationList);
		}
		return EmailSettingsVOList.builder().orgEmailsettingsArray(emailSettingsVOList).build();
	}
	
	private List<EmailSettingsVO> loadEmailSettingList(List<OrganizationSettings> organizationList) {
		List<EmailSettingsVO> emailSettingsVOList = new ArrayList<>();
		emailSettingsVOList = organizationList.stream().map(t -> {
			try {
				return constructEmailSettingsVO(t);
			} catch (JsonProcessingException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			return null;
		}).collect(Collectors.toList());
		return emailSettingsVOList;
	}
	
	@Transactional
	public List<EmailSettingsVO> getEmailSettingsList() {
		List<EmailSettingsVO> emailSettingsVOList = new ArrayList<>();
		List<OrganizationSettings> organizationList = organizationSettingRepository
				.getListTenantIdAndActiveFlag(YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (organizationList != null) {
			return loadEmailSettingList(organizationList);
		}
		return emailSettingsVOList;
	}

	private EmailSettingsVO constructEmailSettingsVO(OrganizationSettings organizationSettings)
			throws JsonProcessingException {
		EmailSettingsDataVO settingData = getEmailDataVO(organizationSettings);
		settingData.setPassword("");
		return EmailSettingsVO.builder().id(organizationSettings.getId()).settingData(settingData)
				.settingName(organizationSettings.getSettingName()).build();
	}

	private void deleteVariableList(List<UUID> deletedEmailSettingIdList) {
		if (deletedEmailSettingIdList != null && !deletedEmailSettingIdList.isEmpty()) {
			List<OrganizationSettings> organizationSettingsList = organizationSettingRepository
					.getListBasedonIdAndTenantIdAndActiveFlag(deletedEmailSettingIdList,
							YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			organizationSettingsList.stream().forEach(f -> {
				f.setActiveFlag(YoroappsConstants.NO);
			});
			organizationSettingRepository.saveAll(organizationSettingsList);
		}
	}

}
