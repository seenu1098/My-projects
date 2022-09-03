package com.yorosis.yoroapps.vo;

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
public class OrganizationVO {
	private UUID id;
	private String orgName;
	private List<String> allowedDomainNames;

	private String subdomainName;

	private String logo;
	private String image;
	private String timezone;
	private String themeName;
	private String themeId;
	private String organizationUrl;
	private String backgroundImage;
	private String type;
	private String customerPaymentId;

}
