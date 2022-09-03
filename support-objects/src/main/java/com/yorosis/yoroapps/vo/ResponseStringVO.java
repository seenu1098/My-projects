package com.yorosis.yoroapps.vo;

import java.sql.Date;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResponseStringVO {
	private String response;
	private String pageName;
	private boolean isDisable;
	private String responseId;
	private int count;
	private Long version;
	private List<UUID> groupNameList;
	private String backgroundImage;
	private UUID userId;
	private String tableId;
	private String tableName;
	private List<String> query;
	private UUID pageId;
	private JsonNode data;
	private boolean isGoogle;
	private boolean isMicrosoft;
	private boolean isAzure;
	private List<String> twoFactorMethods;
	private String otpProvider;
	private LicenseVO licenseVO;
	private Date startDate;
	private Date endDate;
	private boolean isSubscriptionExpired;
	private boolean isAdminOrBillingRole;
	private String isActiveUser;
	private String isPayingCustomer;
	private String customerPaymentId;
	private Long remainingDays;
	private UUID customerId;
	private String clientId;
}