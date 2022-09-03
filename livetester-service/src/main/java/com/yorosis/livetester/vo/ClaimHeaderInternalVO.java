package com.yorosis.livetester.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ClaimHeaderInternalVO {
	private ClaimHeaderInternalDiagnosisVO secondaryDiagnosis;
}
