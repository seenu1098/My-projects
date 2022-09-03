package com.yorosis.yoroapps.vo;

import java.sql.Date;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrgSubscriptionVo {
	private UUID subscriptionId;
	private UUID customerId;
	private UUID planId;
	private String billingType;
	private String planType;
	private Float subscriptionAmount;
	private String subdomainName;
	private Float subscriptionDiscountAmount;
	private Float subscriptionTotalAmount;
	private int teamsCount;
	private int usersCount;
	private int taskboardCount;
	private int workflowCount;
	private Date subscriptionStartDate;
	private Date subscriptionEndDate;
	private Long quantity;
	private Boolean isUpgrade;
	private String username;
}
