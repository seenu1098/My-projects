package com.yorosis.yoroflow.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class CancelUserTask {
	private boolean isCancellableWorkflow;
	private boolean endWorkflowWhenCancelled;
	private String connectionForCancel;

}
