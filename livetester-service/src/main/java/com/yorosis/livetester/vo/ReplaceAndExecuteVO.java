package com.yorosis.livetester.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ReplaceAndExecuteVO {
    private String voidClaimsFirst;
    private int increaseBydays;
	private String environmentName;
	private String batchName;
	private String claimSubmitters;
	private String claimReceiver;
	private long[] claimsId;
	private ReplaceBeneficiaryVO[] replacementBeneficiary;
	private ReplaceProviderVO[] replacementProvider;
	private ReplacePayorVO[] replacementPayor;
	private ReplacePAVO[] replacementPa;
}
