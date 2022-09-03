package com.yorosis.yoroflow.creation.service;

import java.sql.Timestamp;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.PaymentSettings;
import com.yorosis.yoroapps.vo.PaymentSettingVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.PaymentSettingsRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class PaymentSettingService {

	private static final String STRIPE_KEY = "Stripe Key";

	@Autowired
	private PaymentSettingsRepository paymentSettingsRepository;

	@Autowired
	private StringEncryptor jasyptEncryptor;

	public PaymentSettingVO getPublishableKey() {
		PaymentSettings paymentSettings = null;
		YorosisContext currentTenant = YorosisContext.get();
		try {
			YorosisContext.clear();
			YorosisContext context = YorosisContext.builder().tenantId("yoroflow").userName(currentTenant.getUserName())
					.build();
			YorosisContext.set(context);
			paymentSettings = paymentSettingsRepository.findByStripeKeyNameAndTenantIdAndActiveFlag(STRIPE_KEY,
					YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (paymentSettings != null) {
				return PaymentSettingVO.builder().publishKey(jasyptEncryptor.decrypt(paymentSettings.getPublishKey()))
						.build();
			}
		} finally {
			YorosisContext.clear();
			YorosisContext.set(currentTenant);
		}
		return null;
	}

	@Transactional
	public ResponseStringVO savePaymentSettings(PaymentSettingVO vo) {
		if (StringUtils.isNotBlank(vo.getSecretKey()) && StringUtils.isNotBlank(vo.getPublishKey())) {
			String secretKey = jasyptEncryptor.encrypt(vo.getSecretKey());
			String publishKey = jasyptEncryptor.encrypt(vo.getPublishKey());
			if (vo.getId() == null) {
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				PaymentSettings settings = PaymentSettings.builder().stripeKeyName(vo.getStripeKeyName())
						.description(vo.getDescription()).secretKey(secretKey).publishKey(publishKey)
						.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
						.createdOn(timestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
						.activeFlag(YoroappsConstants.YES).build();
				paymentSettingsRepository.save(settings);
				return ResponseStringVO.builder().response("Payment Settings Created Successfully").build();
			} else {
				PaymentSettings paymentSettings = paymentSettingsRepository.findByUuidAndTenantIdAndActiveFlag(
						UUID.fromString(vo.getId()), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				paymentSettings.setStripeKeyName(vo.getStripeKeyName());
				paymentSettings.setDescription(vo.getDescription());
				paymentSettings.setSecretKey(secretKey);
				paymentSettings.setPublishKey(publishKey);
				paymentSettingsRepository.save(paymentSettings);
				return ResponseStringVO.builder().response("Payment Settings Updated Successfully").build();
			}

		}
		return ResponseStringVO.builder().build();
	}

	public PaymentSettingVO getPaymentSettings(String id) {
		PaymentSettings paymentSettings = paymentSettingsRepository.findByUuidAndTenantIdAndActiveFlag(
				UUID.fromString(id), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (paymentSettings.getStripeKeyName() != null) {

			String publishKey = jasyptEncryptor.decrypt(paymentSettings.getPublishKey());
			String secretKey = jasyptEncryptor.decrypt(paymentSettings.getSecretKey());
			String formattedPublishKey = new StringBuilder(publishKey).replace(10, publishKey.length() - 4,
					new String(new char[publishKey.length() - 4]).replace("\0", "x")).toString();

			String formattedSecretKey = new StringBuilder(secretKey)
					.replace(10, secretKey.length(), new String(new char[secretKey.length() - 4]).replace("\0", "x"))
					.toString();
			return PaymentSettingVO.builder().stripeKeyName(paymentSettings.getStripeKeyName())
					.description(paymentSettings.getDescription()).id(paymentSettings.getUuid().toString())
					.publishKey(formattedPublishKey).secretKey(formattedSecretKey).build();
		}
		return null;
	}

}
