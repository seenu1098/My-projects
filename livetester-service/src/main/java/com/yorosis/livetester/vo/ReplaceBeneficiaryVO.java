package com.yorosis.livetester.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class ReplaceBeneficiaryVO {

	private String beneficaryIdentifier;
	private String beneficaryControl;
	private String alwaysReplace; 
}
