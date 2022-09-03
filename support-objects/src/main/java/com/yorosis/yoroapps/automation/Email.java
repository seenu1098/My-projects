package com.yorosis.yoroapps.automation;

import java.util.List;
import java.util.Map;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Singular;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Email {
	private EmailPerson sender;
	@Singular("toRecipientEmail")
	private Set<EmailPerson> toRecipientList;
	private Set<EmailPerson> bccRecipientList;
	private Set<EmailPerson> ccRecipientList;
	private boolean isHTML;
	private List<EmailFile> listEmailFiles;
	private String subject;
	private String body;
	private String templateBodyId;
	private boolean isTemplate;
	private List<Map<String, String>> iterativeTemplateValues;
	private Map<String, String> templateValues;
	private String emailServerName;
	private String tenantId;


}
