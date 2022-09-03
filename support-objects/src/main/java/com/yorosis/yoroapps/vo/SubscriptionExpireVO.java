package com.yorosis.yoroapps.vo;

import java.sql.Date;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SubscriptionExpireVO {
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
	private List<UUID> usersIdList;
	private List<UUID> teamsIdList;
	private List<UUID> workflowsIdList;
	private List<UUID> taskboardsIdList;
	private List<UUID> documentsIdList;
	private List<UUID> workspaceIdList;
	private Boolean isRandomUser;
	private Boolean isRandomTeam;
	private Boolean isRandomWorkflow;
	private Boolean isRandomTaskboard;
}
