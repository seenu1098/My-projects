package com.yorosis.yoroapps.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class AuthDetailsVO {
	private String userName;
	private String tenantId;
	private String token;
	private boolean isAuthenticated;
}
