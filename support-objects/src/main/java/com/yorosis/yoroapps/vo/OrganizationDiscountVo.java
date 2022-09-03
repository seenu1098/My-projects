package com.yorosis.yoroapps.vo;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationDiscountVo {
	private UUID discountId;
	private UUID customerId;
	private float yearlyDiscount;
	private float monthlyDiscount;
	private String planName;
	private UUID planId;
	private float basePrice;
	private float amountPerUserMonthly;
	private float amountPerUserYearly;
}
