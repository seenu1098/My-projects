package com.yorosis.livetester.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentVO {
	private Long environmentId;

	private String environmentName;
	private String targetFolder;
	private String protocol;
	private String host;
	private String port;

	private String logonType;
	private String userName;
	private String password;
	private String pemText;

	private String dbType;
	private String dbHost;
	private String dbPort;
	private String dbName;
	private String dbUsername;
	private String dbPassword;
	private String schemaName;
	private String completionQuery;
	private String tcnQuery;

	private BeneficiaryVO[] beneficiary;
	private ProviderVO[] provider;

}
