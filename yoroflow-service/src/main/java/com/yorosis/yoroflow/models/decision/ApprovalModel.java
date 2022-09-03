package com.yorosis.yoroflow.models.decision;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalModel {
	private String approvalTask;
	private String rejectedTask;
	private String sendBackTask;
}
