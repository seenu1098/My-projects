package com.yorosis.yoroapps.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LicenseVO {
	private String subDomainName;
	private String planName;
	private String featureName;
	private String isAllowed;
	private Long allowedLimit;
	private String category;
	private String response;
}
