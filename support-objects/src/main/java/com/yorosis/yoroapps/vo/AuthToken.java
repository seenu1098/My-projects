package com.yorosis.yoroapps.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthToken {
	private String token;
	private long status;
	private String message;
	private String subDomainName;
	private Boolean termsAndConditionsAccepted;
}
