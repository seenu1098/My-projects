package com.yorosis.yoroflow.services;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.sns.AmazonSNS;
import com.amazonaws.services.sns.AmazonSNSClientBuilder;
import com.amazonaws.services.sns.model.PublishRequest;
import com.amazonaws.services.sns.model.PublishResult;
import com.twilio.http.TwilioRestClient;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.rest.api.v2010.account.MessageCreator;
import com.twilio.type.PhoneNumber;
import com.yorosis.yoroflow.models.SMSKeysVO;
import com.yorosis.yoroflow.models.SmsVO;
import com.yorosis.yoroflow.models.YoroFlowException;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Data
@Service
@Slf4j
@NoArgsConstructor
public class SmsNotifyServices {
	public String sendSMSMessage(SmsVO resolvedsmsVo) throws YoroFlowException {
		String messageId = null;

		if (!CollectionUtils.isEmpty(resolvedsmsVo.getMobileNumber())) {
			for (String mobileNumber : resolvedsmsVo.getMobileNumber()) {
				SMSKeysVO smsProviderDetails = resolvedsmsVo.getSmsProviderDetails();
				if (StringUtils.equalsIgnoreCase(smsProviderDetails.getProviderName(), "twilio")) {
					messageId = sendTextViaTwilio(resolvedsmsVo, mobileNumber);
				} else if (StringUtils.equalsIgnoreCase(smsProviderDetails.getProviderName(), "aws")) {
					messageId = sendTextViaAws(resolvedsmsVo, mobileNumber);
				} else {
					throw new YoroFlowException("Invalid SMS Provider - " + smsProviderDetails.getProviderName());
				}
			}
		}

		return messageId;
	}

	private String sendTextViaAws(SmsVO resolvedsmsVo, String mobileNumber) throws YoroFlowException {
		SMSKeysVO providerDetails = resolvedsmsVo.getSmsProviderDetails();

		if (providerDetails != null && StringUtils.isNotBlank(providerDetails.getSecretKey()) && StringUtils.isNotBlank(providerDetails.getSecretToken())) {
			BasicAWSCredentials awsCreds = new BasicAWSCredentials(providerDetails.getSecretKey(), providerDetails.getSecretToken());
			AmazonSNS snsClient = AmazonSNSClientBuilder.standard().withCredentials(new AWSStaticCredentialsProvider(awsCreds)).withRegion(Regions.US_EAST_1)
					.build();

			PublishResult result = snsClient.publish(new PublishRequest().withMessage(resolvedsmsVo.getMesageBody()).withPhoneNumber(mobileNumber));
			String messageId = result.getMessageId();
			log.warn("SMS sent to phone: {} from AWS, Text is: {}. Result id: {}", mobileNumber, resolvedsmsVo.getMesageBody(), messageId);

			return messageId;
		} else {
			throw new YoroFlowException("Invalid SMS Details....");
		}
	}

	private String sendTextViaTwilio(SmsVO resolvedsmsVo, String mobileNumber) throws YoroFlowException {
		SMSKeysVO providerDetails = resolvedsmsVo.getSmsProviderDetails();

		if (providerDetails != null && StringUtils.isNotBlank(providerDetails.getSecretKey()) && StringUtils.isNotBlank(providerDetails.getSecretToken())
				&& (StringUtils.isNotBlank(providerDetails.getFromPhoneNumber()) || StringUtils.isNotBlank(providerDetails.getServiceName()))) {
			String accountSid = providerDetails.getSecretKey();
			String authToken = providerDetails.getSecretToken();

			TwilioRestClient client = new TwilioRestClient.Builder(accountSid, authToken).build();

			MessageCreator creator = null;

			if (StringUtils.isNotBlank(providerDetails.getFromPhoneNumber())) {
				creator = Message.creator(new PhoneNumber(mobileNumber), // To number
						new PhoneNumber(providerDetails.getFromPhoneNumber().trim()), // From number
						resolvedsmsVo.getMesageBody() // SMS body
				);
			} else {
				creator = Message.creator(new PhoneNumber(mobileNumber), // To number
						providerDetails.getServiceName().trim(), // From number
						resolvedsmsVo.getMesageBody() // SMS body
				);
			}

			Message message = creator.create(client);

			log.warn("SMS sent to phone: {} from {} (phone) / {} (service), Text is: {}. Result id: {}, status: {}", mobileNumber,
					providerDetails.getFromPhoneNumber(), providerDetails.getServiceName(), resolvedsmsVo.getMesageBody(), message.getSid(),
					message.getStatus());

			return message.getSid();
		} else {
			throw new YoroFlowException("Invalid SMS Details....");
		}
	}
}
