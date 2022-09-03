package com.yorosis.yoroflow.models;

import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessInstancePropertyVO {
	private UUID processInstanceId;
	private UUID processInstanceTaskId;
	private String formId;
	private String propertyType;
	private Long version;
	private String taskType;
	private JsonNode data;
	private Long time;
	private String units;
	private List<String> rightAssimnentValues;
	private String computeDataType;
	private String computeString;
	private String decisionLogic;
	private String decisionRules;
	private String url;
	private String name;
	private String operator;
	private String sqlType;
	private Boolean isSendBack;
	private Boolean isApprovalForm;
	private Boolean isCustomForm;
	private String viewDetailsButtonName;
	private String approveButtonName;
	private String startType;
	private String messageBody;
	private String mobileNumbers;
	private String approvalStatus;

}
