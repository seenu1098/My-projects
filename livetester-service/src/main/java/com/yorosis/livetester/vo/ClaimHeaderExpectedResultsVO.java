package com.yorosis.livetester.vo;

import com.google.gson.JsonObject;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimHeaderExpectedResultsVO {
//	private double paidUnits;
//	private double paidAmount;
//	private double allowedUnits;
//	private double allowedAmount;
//	private String claimType;
//	private List<String> errorCodesList;
	private JsonObject elements;
}
