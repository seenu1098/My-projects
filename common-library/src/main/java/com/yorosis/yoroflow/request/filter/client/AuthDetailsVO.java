package com.yorosis.yoroflow.request.filter.client;

import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthDetailsVO {
	private String userName;
	private String tenantId;
	private String token;
	private boolean isAuthenticated;
	private UserDetailsVO userDetails;
	private Set<String> rolesList;
}
