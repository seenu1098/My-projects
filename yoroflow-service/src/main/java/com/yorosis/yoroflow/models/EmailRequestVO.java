package com.yorosis.yoroflow.models;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmailRequestVO {

	private List<String> recipientEmails;
	private String senderEmail;
	private String subject;
	private String messageBody;
}
