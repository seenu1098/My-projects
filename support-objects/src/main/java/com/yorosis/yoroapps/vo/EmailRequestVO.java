package com.yorosis.yoroapps.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmailRequestVO {

	private String recipientEmails;
	private String senderEmail;
	private String subject;
	private String messageBody;
}
