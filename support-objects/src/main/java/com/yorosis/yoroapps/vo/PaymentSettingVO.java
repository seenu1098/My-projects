package com.yorosis.yoroapps.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentSettingVO {
	private String id;
	private String stripeKeyName;
	private String description;
	private String secretKey;
	private String publishKey;
}
