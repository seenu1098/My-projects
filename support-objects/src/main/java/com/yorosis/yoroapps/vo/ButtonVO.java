package com.yorosis.yoroapps.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ButtonVO {
	private String buttonType;
	private String screenType;
	private List<String> parameterFieldNames;
	private String targetPageId;
	private String webServiceCallUrl;
	private String workflowName;
	private String workflowVersion;
	private String workflowKey;
	private String saveAndCallWorkflow;
}
