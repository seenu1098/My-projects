package com.yorosis.yoroapps.vo;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlanDetailsListVo {
	private UUID planId;
	private String planName;
	private Float monthlyPrice;
	private Float yearlyPrice;
	private Float basePrice;
	private UUID customerId;
}
