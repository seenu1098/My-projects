package com.yorosis.livetester.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestcaseVO {
	private Long templateId;

	private Long claimId;

	private String templateName;
	private String claimTestcaseName;
	private String testScenario;

	private String claimSubmitters;
	private String claimReceiver;
	private String formType;
	private String claimType;

	private BeneficiaryVO beneficiary;
	private BeneficiaryVO subscriber;
	private ProviderVO billing;
	private ProviderVO servicing;
	private PayorVO payor;

	private ClaimHeaderVO claimHeader;
	private List<ClaimServiceVO> services;
	private String createdBy;
}
