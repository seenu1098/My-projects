package com.yorosis.yoroapps.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignupUserVO {
	private String emailId;
	private String firstName;
	private String lastName;
	private String phoneNo;
	private String createdFromIp;
	private String invitationCode;
	private String emailSent;
	private String createdBy;
	private String modifiedBy;
}
