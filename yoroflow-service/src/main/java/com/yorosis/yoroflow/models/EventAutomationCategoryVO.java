package com.yorosis.yoroflow.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventAutomationCategoryVO {
	public String categoryName;
	public String automation;
	public String applicationName;
}
