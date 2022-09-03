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
public class SmsFieldVO {
	private String mesageBody;
	private String providerName;
	private List<MobileNumbersVo> mobileNumbersList;
}
