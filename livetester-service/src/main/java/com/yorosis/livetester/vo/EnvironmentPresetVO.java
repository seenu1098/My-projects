package com.yorosis.livetester.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentPresetVO {
	private long id;
	private long environmentId;
	private String type;
	private String key;
	private BeneficiaryVO beneficiary;
	private ProviderVO provider;
	private PayorVO payor;
	private PaVO paVO;

}
