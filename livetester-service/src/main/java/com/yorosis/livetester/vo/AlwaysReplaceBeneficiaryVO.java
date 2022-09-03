package com.yorosis.livetester.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlwaysReplaceBeneficiaryVO {

	private BeneficiaryVO beneficiaryVO;
	private long alwaysReplace;
}
