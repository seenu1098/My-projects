package com.yorosis.yoroflow.models;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class SmsVO {
	private String mesageBody;
	private List<String> mobileNumber;
	private SMSKeysVO smsProviderDetails;
}
