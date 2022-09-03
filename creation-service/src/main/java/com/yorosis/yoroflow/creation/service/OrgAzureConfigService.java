package com.yorosis.yoroflow.creation.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.yorosis.yoroapps.entities.AuthMethods;
import com.yorosis.yoroapps.entities.OrganizationAzureConfig;
import com.yorosis.yoroapps.vo.AuthenticationArray;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.OrgAzureConfigRepository;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class OrgAzureConfigService {

	@Autowired
	private OrgAzureConfigRepository orgAzureConfigRepository;

	@Autowired
	private StringEncryptor jasyptEncryptor;

	private OrganizationAzureConfig construcVOtoDTO(AuthenticationArray authenticationArray) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return OrganizationAzureConfig.builder()
				.azureClientId((authenticationArray.getClientId() != null)
						? jasyptEncryptor.encrypt(authenticationArray.getClientId())
						: null)
				.azureSecretId((authenticationArray.getSecretId() != null)
						? jasyptEncryptor.encrypt(authenticationArray.getSecretId())
						: null)
				.azureAllowedGroup(domainNames(authenticationArray)).modifiedBy(YorosisContext.get().getUserName())
				.azureTenantId(authenticationArray.getTenantId()).modifiedOn(timestamp)
				.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
				.tenantId(YorosisContext.get().getTenantId()).activeFlag(YorosisConstants.YES).build();
	}

	@Transactional
	public ResponseStringVO saveAzureMethods(AuthenticationArray authenticationArray, AuthMethods authMethods) {
		ResponseStringVO response = null;
		if (BooleanUtils.isTrue(authenticationArray.getIsAuthProvider())) {
			if (authenticationArray.getId() == null) {
				OrganizationAzureConfig organizationAzureConfig = construcVOtoDTO(authenticationArray);
				organizationAzureConfig.setAuthMethods(authMethods);
				orgAzureConfigRepository.save(organizationAzureConfig);
				response = ResponseStringVO.builder().response("Azure Id saved").build();
			} else {
				OrganizationAzureConfig organizationAzureConfig = orgAzureConfigRepository.findByIdAndactiveFlag(
						authenticationArray.getId(), YorosisConstants.YES, YorosisContext.get().getTenantId());
				if (organizationAzureConfig != null) {
					Timestamp timestamp = new Timestamp(System.currentTimeMillis());
					organizationAzureConfig.setModifiedBy(YorosisContext.get().getUserName());
					organizationAzureConfig.setModifiedOn(timestamp);
					organizationAzureConfig.setAzureClientId((authenticationArray.getClientId() != null)
							? jasyptEncryptor.encrypt(authenticationArray.getClientId())
							: organizationAzureConfig.getAzureClientId());
					organizationAzureConfig.setAzureSecretId((authenticationArray.getSecretId() != null)
							? jasyptEncryptor.encrypt(authenticationArray.getSecretId())
							: organizationAzureConfig.getAzureSecretId());
					organizationAzureConfig.setAzureAllowedGroup(domainNames(authenticationArray));
					organizationAzureConfig.setAzureTenantId(authenticationArray.getTenantId());
					orgAzureConfigRepository.save(organizationAzureConfig);
					response = ResponseStringVO.builder().response("Azure Id updated").build();
				} else {
					OrganizationAzureConfig organizationAzureConfigs = construcVOtoDTO(authenticationArray);
					organizationAzureConfigs.setAuthMethods(authMethods);
					orgAzureConfigRepository.save(organizationAzureConfigs);
					response = ResponseStringVO.builder().response("Azure Id saved").build();
				}
			}
		}
		return response;
	}

	@Transactional
	public AuthenticationArray getAzureMethods(AuthenticationArray authenticationArray) {
		OrganizationAzureConfig organizationAzureConfig = orgAzureConfigRepository.findByIdAndactiveFlag(
				authenticationArray.getId(), YorosisConstants.YES, YorosisContext.get().getTenantId());
		if (organizationAzureConfig != null) {
			authenticationArray.setClientId((organizationAzureConfig.getAzureClientId() != null)
					? jasyptEncryptor.decrypt(organizationAzureConfig.getAzureClientId())
					: null);
			authenticationArray.setTenantId(organizationAzureConfig.getAzureTenantId());
			authenticationArray.setAllowedGroupType(setGroupType(organizationAzureConfig));
			authenticationArray.setAllowedGroup(setAllowedGroupNames(organizationAzureConfig));
		}
		return authenticationArray;
	}

	@Transactional
	public ResponseStringVO getAzureClient(UUID authId, ResponseStringVO vo) {
		OrganizationAzureConfig organizationAzureConfig = orgAzureConfigRepository.findByIdAndactiveFlag(authId,
				YorosisConstants.YES, YorosisContext.get().getTenantId());
		if (organizationAzureConfig != null) {
			vo.setClientId((organizationAzureConfig.getAzureClientId() != null)
					? jasyptEncryptor.decrypt(organizationAzureConfig.getAzureClientId())
					: null);
		}
		return vo;
	}

	private List<String> setAllowedGroupNames(OrganizationAzureConfig organizationAzureConfig) {
		List<String> allowdDomains = new ArrayList<>();
		if (StringUtils.equals(organizationAzureConfig.getActiveFlag(), YoroappsConstants.YES)) {
			if (!StringUtils.isEmpty(organizationAzureConfig.getAzureAllowedGroup())
					&& (!StringUtils.equals(organizationAzureConfig.getAzureAllowedGroup(), "all"))) {
				allowdDomains = Arrays.asList(organizationAzureConfig.getAzureAllowedGroup().split(","));
			}
		}
		return allowdDomains;
	}

	private String setGroupType(OrganizationAzureConfig organizationAzureConfig) {
		if (!StringUtils.isEmpty(organizationAzureConfig.getAzureAllowedGroup())
				&& (!StringUtils.equals(organizationAzureConfig.getAzureAllowedGroup(), "all"))) {
			return "specific";
		} else {
			return "all";
		}
	}

	private String domainNames(AuthenticationArray authenticationArray) {
		StringBuilder groupName = new StringBuilder();
		if (authenticationArray != null && authenticationArray.getIsAuthProvider()) {
			if (!CollectionUtils.isEmpty(authenticationArray.getAllowedGroup())
					&& StringUtils.equals(authenticationArray.getAllowedGroupType(), "specific"))
				for (String name : authenticationArray.getAllowedGroup()) {
					if (groupName.length() > 0) {
						groupName.append(",");
					}
					groupName.append(name);
				}
			else if (StringUtils.equals(authenticationArray.getAllowedGroupType(), "all")) {
				groupName.append("all");
			}
		}

		return groupName.toString();
	}
}
