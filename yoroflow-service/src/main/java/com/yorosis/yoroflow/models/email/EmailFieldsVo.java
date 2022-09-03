package com.yorosis.yoroflow.models.email;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class EmailFieldsVo {
	private String emailTemplate;
	private String attachFile;
	private String subject;
	private Boolean bcc;
	private Boolean cc;
	private Boolean fieldType;
	private String repeatableField;
	private String emailFrom;
	private String senderName;
	private List<String> emailTo;
	private List<String> emailBCC;
	private List<String> emailCC;
}
