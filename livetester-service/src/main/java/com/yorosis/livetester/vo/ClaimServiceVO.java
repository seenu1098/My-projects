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
public class ClaimServiceVO {
	private Long claimServiceId;
	private String fromDate;
	private String toDate;
	private String procedureCode;
	private String procedureCodeType;
	private String billedUnitsMeasure;
	private String revenueCode;
	private ProviderVO serviceFacility;
	private String facilityType;

	private ProviderVO servicing;

	private double billedAmount;
	private double billedUnits;

	private String diagnosisCode1;
	private String diagnosisCode2;
	private String diagnosisCode3;
	private String diagnosisCode4;
	
	private List<String> modifiersList;
	private ServiceLineDentalVO dental;
	private String priorAuth1;
	private String priorAuth2;
	private JsonNode expectedResult;
	private String expectedElements;

	private ClaimServiceInternalVO internal;

}
