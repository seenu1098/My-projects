package com.yorosis.yoroapps.vo;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class AuthenticationArray {
	private UUID id;
	private String authProvider;
	private String selectDomainType;
	private List<String> allowedDomain;
	private Boolean isAuthProvider;
	private List<UUID> associateGroups;
	private List<UUID> associateRoles;
	private String clientId;
	private String secretId;
	private String tenantId;
	private String allowedGroupType;
	private List<String> allowedGroup;
}
