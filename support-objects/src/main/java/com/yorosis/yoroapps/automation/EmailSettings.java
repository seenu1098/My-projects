package com.yorosis.yoroapps.automation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailSettings {
	private String hostName;
	private String username;
	private String password;
	private int port;
	private boolean smtpAuth;
	private boolean starttlsEnable;

}
