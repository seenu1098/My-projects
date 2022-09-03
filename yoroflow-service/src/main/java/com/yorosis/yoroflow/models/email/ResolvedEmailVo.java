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
public class ResolvedEmailVo {
	private String emailTemplate;
	private List<String> emailTo;
	private List<String> emailBCC;
	private List<String> emailCC;
	private String attachFile;
}
