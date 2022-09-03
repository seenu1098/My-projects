package com.yorosis.yoroflow.creation.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.SMSKeys;
import com.yorosis.yoroapps.vo.OrganizationSMSKeys;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SMSKeyWorkflowVO;
import com.yorosis.yoroapps.vo.SMSKeysVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.SMSKeysManagementRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class SMSKeysManagementService {

	@Autowired
	private SMSKeysManagementRepository smsKeysManagementRepository;

	@Autowired
	private StringEncryptor jasyptEncryptor;

	private SMSKeys construcVOtoDTO(SMSKeysVO smsKeysVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return SMSKeys.builder().providerName(smsKeysVO.getProviderName())
				.secretKey((smsKeysVO.getSecretKey() != null) ? jasyptEncryptor.encrypt(smsKeysVO.getSecretKey()) : null)
				.secretToken((smsKeysVO.getSecretToken() != null) ? jasyptEncryptor.encrypt(smsKeysVO.getSecretToken()) : null)
				.fromPhoneNumber(smsKeysVO.getFromPhoneNumber()).serviceName(smsKeysVO.getServiceName()).tenantId(YorosisContext.get().getTenantId())
				.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.activeFlag(YoroappsConstants.YES).build();
	}

	private SMSKeysVO constructDTOtoVO(SMSKeys smsKey) {
		return SMSKeysVO.builder().id(smsKey.getId()).providerName(smsKey.getProviderName())
				.secretKey((smsKey.getSecretKey() != null) ? jasyptEncryptor.decrypt(smsKey.getSecretKey()) : null)
				.secretToken((smsKey.getSecretToken() != null) ? jasyptEncryptor.decrypt(smsKey.getSecretToken()) : null)
				.fromPhoneNumber(smsKey.getFromPhoneNumber()).serviceName(smsKey.getServiceName()).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public ResponseStringVO saveSMSKeys(OrganizationSMSKeys organizationSMSKeys) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		deleteKeyList(organizationSMSKeys);
		for (SMSKeysVO smsKeys : organizationSMSKeys.getOrganizationSmsKeys()) {
			if (smsKeys.getId() == null) {
				SMSKeys smsKey = construcVOtoDTO(smsKeys);
				smsKeysManagementRepository.save(smsKey);
			} else {
				SMSKeys smsKey = smsKeysManagementRepository.getOrganizationSMSKey(smsKeys.getId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				smsKey.setProviderName(smsKeys.getProviderName());
				smsKey.setSecretKey((smsKeys.getSecretKey() != null) ? jasyptEncryptor.encrypt(smsKeys.getSecretKey()) : null);
				smsKey.setSecretToken((smsKeys.getSecretToken() != null) ? jasyptEncryptor.encrypt(smsKeys.getSecretToken()) : null);
				smsKey.setModifiedBy(YorosisContext.get().getUserName());
				smsKey.setModifiedOn(timestamp);
				smsKey.setFromPhoneNumber(smsKeys.getFromPhoneNumber());
				smsKey.setServiceName(smsKeys.getServiceName());
				smsKeysManagementRepository.save(smsKey);
			}
		}

		return ResponseStringVO.builder().response("SMS Keys - saved successfully").build();
	}

	private void deleteKeyList(OrganizationSMSKeys organizationSMSKeys) {
		if (!organizationSMSKeys.getDeleteKeys().isEmpty()) {
			for (UUID id : organizationSMSKeys.getDeleteKeys()) {
				if (id != null) {
					SMSKeys smsKey = smsKeysManagementRepository.getOrganizationSMSKey(id, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
					smsKey.setActiveFlag(YoroappsConstants.NO);
					smsKeysManagementRepository.save(smsKey);
				}
			}
		}
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public List<SMSKeysVO> getSMSKeys() {
		List<SMSKeysVO> list = new ArrayList<>();
		for (SMSKeys smsKey : smsKeysManagementRepository.getSMSKeys(YorosisContext.get().getTenantId(), YoroappsConstants.YES)) {
			list.add(constructDTOtoVO(smsKey));
		}
		return list;
	}

	@Transactional
	public ResponseStringVO saveSMSKeysFromWorkflow(OrganizationSMSKeys organizationSMSKeys) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		List<SMSKeysVO> list = organizationSMSKeys.getOrganizationSmsKeys();

		for (SMSKeysVO smsKeys : list) {
			if (smsKeys.getId() == null) {
				SMSKeys smsKey = construcVOtoDTO(smsKeys);
				smsKeysManagementRepository.save(smsKey);
			} else {
				SMSKeys smsKey = smsKeysManagementRepository.getOrganizationSMSKey(smsKeys.getId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				smsKey.setProviderName(smsKeys.getProviderName());
				smsKey.setSecretKey((smsKeys.getSecretKey() != null) ? jasyptEncryptor.encrypt(smsKeys.getSecretKey()) : null);
				smsKey.setSecretToken((smsKeys.getSecretToken() != null) ? jasyptEncryptor.encrypt(smsKeys.getSecretToken()) : null);
				smsKey.setModifiedBy(YorosisContext.get().getUserName());
				smsKey.setModifiedOn(timestamp);
				smsKey.setFromPhoneNumber(smsKeys.getFromPhoneNumber());
				smsKey.setServiceName(smsKeys.getServiceName());
				smsKeysManagementRepository.save(smsKey);
			}
		}

		return ResponseStringVO.builder().response("SMS Keys - saved successfully").build();
	}

	@Transactional
	public List<SMSKeyWorkflowVO> getSMSKeysForWorkflow() {
		List<SMSKeyWorkflowVO> list = new ArrayList<>();
		for (SMSKeys smsKey : smsKeysManagementRepository.getSMSKeys(YorosisContext.get().getTenantId(), YoroappsConstants.YES)) {
			list.add(constructSMSKeyForWorkflow(smsKey));
		}
		return list;
	}

	private SMSKeyWorkflowVO constructSMSKeyForWorkflow(SMSKeys smsKey) {
		return SMSKeyWorkflowVO.builder().providerName(getProviderNameForWorkflow(smsKey)).id(smsKey.getId()).build();
	}

	private String getProviderNameForWorkflow(SMSKeys smsKey) {
		String providerName = smsKey.getProviderName();
		if (!StringUtils.isEmpty(smsKey.getFromPhoneNumber())) {
			providerName = providerName + "(" + smsKey.getFromPhoneNumber() + ")";
		}
		if (!StringUtils.isEmpty(smsKey.getServiceName())) {
			providerName = providerName + "(" + smsKey.getServiceName() + ")";
		}
		return providerName;
	}

	@Transactional
	public ResponseStringVO updateSMSKeys(OrganizationSMSKeys organizationSMSKeys) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		deleteKeyList(organizationSMSKeys);
		for (SMSKeysVO smsKeys : organizationSMSKeys.getOrganizationSmsKeys()) {
			if (smsKeys.getId() == null) {
				SMSKeys smsKey = construcVOtoDTO(smsKeys);
				smsKeysManagementRepository.save(smsKey);
			} else {
				SMSKeys smsKey = smsKeysManagementRepository.getOrganizationSMSKey(smsKeys.getId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				smsKey.setProviderName(smsKeys.getProviderName());
				smsKey.setSecretKey((smsKeys.getSecretKey() != null) ? jasyptEncryptor.encrypt(smsKeys.getSecretKey()) : null);
				smsKey.setSecretToken((smsKeys.getSecretToken() != null) ? jasyptEncryptor.encrypt(smsKeys.getSecretToken()) : null);
				smsKey.setModifiedBy(YorosisContext.get().getUserName());
				smsKey.setModifiedOn(timestamp);
				smsKey.setFromPhoneNumber(smsKeys.getFromPhoneNumber());
				smsKey.setServiceName(smsKeys.getServiceName());
				smsKeysManagementRepository.save(smsKey);
			}
		}

		return ResponseStringVO.builder().response("SMS Keys - updated successfully").build();
	}

}
