package com.yorosis.yoroapps.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TwoFactorAuthVO {
	private boolean enableTwoFactor;
	private List<String> twoFactorsList;
	private List<String> selectedTwofactorsList;
	private String subdomainName;
}
