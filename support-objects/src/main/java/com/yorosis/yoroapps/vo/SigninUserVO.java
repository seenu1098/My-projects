package com.yorosis.yoroapps.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SigninUserVO {
	private String username;
	private String password;
	private String recaptchaResponse;
	private String otpNumber;
	private boolean hasTwofactor;
	private String userType;
}
