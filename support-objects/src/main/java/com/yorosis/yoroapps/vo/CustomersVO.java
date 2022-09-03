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
public class CustomersVO {
	private UUID id;
	private String orgName;
	private String actualDomainName;
	private List<String> allowedDomainNames;
	private String timezone;
	private String defaultLanguge;

	private String subdomainName;

	private String userEmailId;
	private String contactEmailId;
	private String password;
	private String confirmPassword;
	private String isPayingCustomer;

	private String userName;

	private String firstName;
	private String lastName;

	private String invitationCode;

	private String logo;
	private String image;

	private String orgPlanType;
	private String orgBillingType;

	private String themeName;
	private String themeId;
	private String organizationUrl;
	private Boolean twoFactor;
	private String serverFarm;
	private String dataSourceName;
	private String backgroundImage;
	private Date startDate;
	private Date endDate;
	private int maximumUsers;
	private String type;
	private String customerPaymentId;
	private List<String> authenticationMethod;
	private List<OrganizationDiscountVo> organizationDiscountList;

	private Date subscriptionStartDate;
	private Date subscriptionEndDate;

	private String phoneNumber;
}
