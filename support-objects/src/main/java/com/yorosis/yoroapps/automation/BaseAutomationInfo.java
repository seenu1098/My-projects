package com.yorosis.yoroapps.automation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class BaseAutomationInfo {
	private String automationType;
	private String tenantId;
	private String domain;
	private String subDomain;
	private AutomationUser automationUser;
	// @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	// private LocalDateTime eventTime;

}
