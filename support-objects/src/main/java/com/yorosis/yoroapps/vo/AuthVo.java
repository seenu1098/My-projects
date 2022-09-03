package com.yorosis.yoroapps.vo;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthVo {
	private String tokenId;
	private String email;
	private String otpNumber;
	private boolean hasTwofactor;
	private boolean isValidUser;
	private boolean isSilentToken;
	private UUID authMethodId;
	private String loginType;
}
