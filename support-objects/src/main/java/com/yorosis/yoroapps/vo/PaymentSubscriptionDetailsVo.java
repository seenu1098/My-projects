package com.yorosis.yoroapps.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSubscriptionDetailsVo {
	private String itemDescription;
	private String monthlyPlanType1;
	private String monthlyPlanType2;
	private String monthlyPlanType3;
	private String monthlyPlanType4;
	private String yearlyPlanType1;
	private String yearlyPlanType2;
	private String yearlyPlanType3;
	private String yearlyPlanType4;
}
