package com.yorosis.livetester.vo;

import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimHeaderVO {
	private double billedUnits;
	private double billedAmount;

	private String fromDate;
	private String toDate;
	
	private String frequency;
	//new field
	private String parentTCN;
	private String source;
	
	private String patientControlNo;
	private String facilityType;

	private String primaryDiagnosis;
	private List<String> secondaryDiagnosisList;
	private String admitDiagnosis;
	private String surgicalCode;
	private String surgicalCodeDate;
	private ProviderVO serviceFacility;
	private List<ClaimValueCodeVO> valueCodeList;
	private List<ClaimSurgicalCodeVO> surgicalCodeList;
	private List<ClaimOccuranceCodeVO> occuranceCodeList;
	private List<ClaimOccuranceSpanCodeVO> occuranceSpanCodeList;
	private String priorAuth1;
	private String priorAuth2;
	private String drgCode;
	private String admitDate;
	private String dischargeDate;
	private String patientStatus;
	private String admitTime;
	private String dischargeTime;
	private String dischargeStatus;
	private List<String> conditionCodeList;
	private List<String> treatmentCodeList;
	private DentalVO dental;
	private JsonNode expectedResult;
	private String expectedElements;
	
	private ClaimHeaderInternalVO internal;
}
