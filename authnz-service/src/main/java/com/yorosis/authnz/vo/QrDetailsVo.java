package com.yorosis.authnz.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class QrDetailsVo {
	private String qrImageUrl;
	private String[] codes;
	private String secret;
	private String otp;
	private String userName;
	private String otpProvider;
	private String isCheck;
	private Integer cc;
}

