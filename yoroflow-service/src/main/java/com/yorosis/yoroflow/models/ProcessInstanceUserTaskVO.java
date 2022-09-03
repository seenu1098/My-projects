package com.yorosis.yoroflow.models;

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
public class ProcessInstanceUserTaskVO {
	private UUID processInstanceTaskId;
	private String formId;
	private String status;
	private Boolean isSendBack;
	private Boolean isApprovalForm;
	private Boolean isCustomForm;
	private UUID processInstanceId;
	private String approveButtonName;
	private Long version;
	private JsonNode initialValues;
	private String taskType;
	private Boolean isReject;
	private Boolean enableSaveAsDraft;
	private String message;
	private Boolean isCancelWorkflow;
	private String cancelButtonName;
	private String approveMessage;
	private String rejectMessage;
	private String approvalButtonName;
	private String rejectButtonName;
	private String sendBackButtonName;
	private Boolean printOnScreen;
	private String taskName;
	private Boolean enablePrinting;
	private String sendBackComment;
	private String approveComment;
	private String rejectComment;
}
