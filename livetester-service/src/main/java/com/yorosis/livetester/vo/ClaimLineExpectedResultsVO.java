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
public class ClaimLineExpectedResultsVO {
	private double paidUnits;
	private double paidAmount;
	private double allowedUnits;
	private double allowedAmount;

	private List<String> errorCodesList;
}
