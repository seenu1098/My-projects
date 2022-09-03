package com.yorosis.livetester.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ClaimServiceInternalVO {
	private int diagnosisCodePointer1;
	private int diagnosisCodePointer2;
	private int diagnosisCodePointer3;
	private int diagnosisCodePointer4;
	private int lineSequenceNo;
	private ClaimServiceInternalModifiersVO modifiers;
}
