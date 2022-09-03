package com.yorosis.yoroflow.services;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.yorosis.yoroflow.entities.EnvironmentVariable;
import com.yorosis.yoroflow.entities.ProcessDefinition;
import com.yorosis.yoroflow.entities.ProcessInstance;
import com.yorosis.yoroflow.entities.SMSKeys;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.EnvVariableRequestVO;
import com.yorosis.yoroflow.models.EnvVariableVO;
import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.SMSKeysVO;
import com.yorosis.yoroflow.repository.EnvironmentRepository;
import com.yorosis.yoroflow.repository.ProcessDefinitionRepo;
import com.yorosis.yoroflow.repository.ProcessInstanceRepo;
import com.yorosis.yoroflow.repository.SMSKeysManagementRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class AdminService {

	@Autowired
	private EnvironmentRepository envRepo;

	@Autowired
	private ProcessInstanceRepo processInstanceRepo;

	@Autowired
	private ProcessDefinitionRepo processDefinitionRepo;

	@Autowired
	private StringEncryptor jasyptEncryptor;

	@Autowired
	private SMSKeysManagementRepository smsKeysManagementRepository;

	private EnvironmentVariable construcVOtoDTO(EnvVariableRequestVO envVariableRequestVO) {
		return EnvironmentVariable.builder().name(envVariableRequestVO.getName()).value(envVariableRequestVO.getValue())
				.processDefinition(processDefinitionRepo.findByProcessDefinitionIdAndTenantIdAndActiveFlag(envVariableRequestVO.getProcessDefinition(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES))
				.tenantId(YorosisContext.get().getTenantId()).activeFlag(YorosisConstants.YES).build();
	}

	private EnvVariableRequestVO construcDTOtoVO(EnvironmentVariable envVariable) {
		return EnvVariableRequestVO.builder().id(envVariable.getId()).name(envVariable.getName()).value(envVariable.getValue()).build();
	}

	@Transactional
	public ResponseStringVO saveEnvironmentService(EnvVariableVO envVariableVO) {
		ResponseStringVO response = null;

		List<EnvVariableRequestVO> list = envVariableVO.getEnvVariableRequestVOList();
		deleteVariableList(envVariableVO);

		for (EnvVariableRequestVO envVariableRequestVO : list) {
			if (envVariableRequestVO.getId() == null) {
				EnvironmentVariable enVariable = construcVOtoDTO(envVariableRequestVO);
				enVariable.setCreatedBy(YorosisContext.get().getUserName());
				enVariable.setUpdatedBy(YorosisContext.get().getUserName());
				envRepo.save(enVariable);

				response = ResponseStringVO.builder().response("Environment Variables are saved").build();
			} else {
				EnvironmentVariable enVariable = envRepo.getListBasedonIdAndTenantIdAndActiveFlag(envVariableRequestVO.getId(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				enVariable.setName(envVariableRequestVO.getName());
				enVariable.setValue(envVariableRequestVO.getValue());
				enVariable.setCreatedBy(YorosisContext.get().getUserName());
				enVariable.setUpdatedBy(YorosisContext.get().getUserName());
				envRepo.save(enVariable);

				response = ResponseStringVO.builder().response("Environment Variables are updated").build();
			}
		}

		return response;
	}

	@Transactional
	public List<EnvVariableRequestVO> getEnvironmentVariables(String key) {
		List<EnvVariableRequestVO> list = new ArrayList<>();
		List<ProcessDefinition> procDefKeyList = processDefinitionRepo.getProcessDefKey(key, YorosisContext.get().getTenantId(), YorosisConstants.YES);
		for (ProcessDefinition procKeyList : procDefKeyList) {
			List<EnvironmentVariable> envList = envRepo.getListBasedonProcessDefinitionIdAndTenantIdAndActiveFlag(procKeyList.getProcessDefinitionId(),
					YorosisContext.get().getTenantId(), YorosisConstants.YES);

			for (EnvironmentVariable envVariable : envList) {
				list.add(construcDTOtoVO(envVariable));
			}
		}

		return list;
	}

	private void deleteVariableList(EnvVariableVO envVariableVO) {
		if (!envVariableVO.getDeletedColumnIDList().isEmpty()) {
			for (UUID id : envVariableVO.getDeletedColumnIDList()) {
				if (id != null) {
					EnvironmentVariable enVariable = envRepo.getListBasedonIdAndTenantIdAndActiveFlag(id, YorosisContext.get().getTenantId(),
							YorosisConstants.YES);
					enVariable.setActiveFlag(YorosisConstants.NO);
					envRepo.save(enVariable);
				}
			}
		}
	}

	@Transactional
	public EnvVariableRequestVO getEnvironmentVariable(UUID instanceId, String name) {
		ProcessInstance processInstance = processInstanceRepo.getOne(instanceId);
		return getEnvironmentVariable(processInstance, name);
	}
	
	
	@Transactional
	public EnvVariableRequestVO getEnvironmentVariable(ProcessInstance processInstance, String name) {
		
		List<ProcessDefinition> procDefKeyList = processDefinitionRepo.getProcessDefKey(processInstance.getProcessDefinition().getKey(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		for (ProcessDefinition procKeyList : procDefKeyList) {
			EnvironmentVariable envVariable = envRepo.variableBasedonProcessDefinitionIdAndName(procKeyList.getProcessDefinitionId(), name,
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (envVariable != null) {
				return mapVOToDTO(envVariable);
			}
		}
		return null;
	}

	@Transactional
	public List<FieldVO> getFieldList(String workflowKey) {
		List<ProcessDefinition> listProcessDefinition = processDefinitionRepo.findBykeyAndTenantIdAndActiveFlagIgnoreCase(workflowKey,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		if (CollectionUtils.isEmpty(listProcessDefinition)) {
			return Collections.emptyList();
		}

		return getEnvironmentVariables(listProcessDefinition.get(0).getKey()).stream().map(this::mapVOtoFieldVO).collect(Collectors.toList());
	}

	private EnvVariableRequestVO mapVOToDTO(EnvironmentVariable envVariable) {
		EnvVariableRequestVO vnvVariableRequestVO = new EnvVariableRequestVO();
		if (envVariable != null) {
			BeanUtils.copyProperties(envVariable, vnvVariableRequestVO);
		}

		return vnvVariableRequestVO;
	}

	private FieldVO mapVOtoFieldVO(EnvVariableRequestVO envVariableVO) {
		return FieldVO.builder().fieldName(envVariableVO.getName()).fieldId(envVariableVO.getName()).datatype("text").build();
	}

	@Transactional
	public SMSKeysVO getProviderDetails(String providerName) {
//		if (StringUtils.isNotBlank(smsFields.getProviderName())) {
		SMSKeys smsKey = smsKeysManagementRepository.getSMSKeyById(UUID.fromString(providerName), YorosisConstants.YES, YorosisContext.get().getTenantId());
		if (smsKey != null) {
			return constructDTOtoVO(smsKey);
		}
		return SMSKeysVO.builder().build();
	}

	private SMSKeysVO constructDTOtoVO(SMSKeys smsKey) {
		return SMSKeysVO.builder().id(smsKey.getId()).providerName(smsKey.getProviderName())
				.secretKey(StringUtils.isNotBlank(smsKey.getSecretKey()) ? jasyptEncryptor.decrypt(smsKey.getSecretKey()) : null)
				.secretToken(StringUtils.isNotBlank(smsKey.getSecretToken()) ? jasyptEncryptor.decrypt(smsKey.getSecretToken()) : null)
				.fromPhoneNumber(smsKey.getFromPhoneNumber()).serviceName(smsKey.getServiceName()).build();
	}
}
