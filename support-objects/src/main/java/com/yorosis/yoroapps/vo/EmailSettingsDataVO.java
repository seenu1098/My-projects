package com.yorosis.yoroapps.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailSettingsDataVO {
	private String hostName;
	private String username;
	private String password;
	private int port;
	private boolean smtpAuth;
	private boolean starttlsEnable;

}
