package com.yorosis.yoroapps.vo;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationSMSKeys {
	private List<SMSKeysVO> organizationSmsKeys;
	private List<UUID> deleteKeys;
	private String subdomainName;
}
