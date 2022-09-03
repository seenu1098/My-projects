package com.yorosis.yoroflow.services;

import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroflow.entities.MetricsData;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.entities.SMSKeys;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.SMSKeysVO;
import com.yorosis.yoroflow.models.SmsFieldVO;
import com.yorosis.yoroflow.models.SmsVO;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.repository.MetricDataRepository;
import com.yorosis.yoroflow.repository.SMSKeysManagementRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.schedule.services.SchedulerMultiTenancyService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SmstaskServiceHelper {

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private SmsNotifyServices smsNotifyService;

	@Autowired
	private SMSDataResolveService smsDataResolveService;

	@Autowired
	private MetricDataRepository metricDataRepository;

	@Autowired
	private SchedulerMultiTenancyService multiTenancyService;

	@Autowired
	@Qualifier("jasyptEncryptor")
	private StringEncryptor jasyptEncryptor;

	@Autowired
	private SMSKeysManagementRepository smsKeysManagementRepository;

	public void smsTaskService(ProcessInstanceTask procInstanceTask, JsonNode procDefTaskProperty, boolean remainder) throws YoroFlowException {
		try {
			SmsFieldVO smsFields = objectMapper.treeToValue(procDefTaskProperty, SmsFieldVO.class);

			SmsVO resolvedsmsVo = new SmsVO();
			resolvedsmsVo.setSmsProviderDetails(getProviderDetails(smsFields));
			resolvedsmsVo.setMesageBody(smsDataResolveService.resolvedMessageBody(procInstanceTask, smsFields.getMesageBody()));
			resolvedsmsVo.setMobileNumber(smsDataResolveService.resolvedMobileNumber(procInstanceTask, smsFields.getMobileNumbersList()));

			log.info("Attempting to send text to {}", resolvedsmsVo.getMobileNumber());
			smsNotifyService.sendSMSMessage(resolvedsmsVo);
			if (remainder) {
				multiTenancyService.saveTaskComments(procInstanceTask, resolvedsmsVo.getMesageBody());
			}
			if (!CollectionUtils.isEmpty(resolvedsmsVo.getMobileNumber())) {
				for (String mobileNumber : resolvedsmsVo.getMobileNumber()) {
					metricDataRepository.save(constructMetricsDataFromVo(procInstanceTask, mobileNumber));
				}
			}
		} catch (JsonProcessingException e) {
			throw new YoroFlowException(ExceptionUtils.getRootCauseMessage(e));
		}
	}

	private MetricsData constructMetricsDataFromVo(ProcessInstanceTask procInstanceTask, String mobileNumber) {
		return MetricsData.builder().metricType("sms").recipientId(mobileNumber).taskId(procInstanceTask.getProcessInstanceTaskId())
				.createdBy(YorosisContext.get().getUserName()).tenantId(YorosisContext.get().getTenantId()).build();
	}

	private SMSKeysVO getProviderDetails(SmsFieldVO smsFields) {
		if (StringUtils.isNotBlank(smsFields.getProviderName())) {
			SMSKeys smsKey = smsKeysManagementRepository.getSMSKeyById(UUID.fromString(smsFields.getProviderName()), YorosisConstants.YES,
					YorosisContext.get().getTenantId());
			if (smsKey != null) {
				return constructDTOtoVO(smsKey);
			}
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
