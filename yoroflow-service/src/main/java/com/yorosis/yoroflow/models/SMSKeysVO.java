package com.yorosis.yoroflow.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SMSKeysVO {
	private UUID id;
	private String providerName;
	private String secretKey;
	private String secretToken;
	private String fromPhoneNumber;
	private String serviceName;
}
