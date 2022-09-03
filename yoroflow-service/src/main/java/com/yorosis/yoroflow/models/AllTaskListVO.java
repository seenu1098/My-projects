package com.yorosis.yoroflow.models;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllTaskListVO {
	private String taskName;
	private String viewDetailsButtonName;
	private boolean cancellableWorkflow;
	private String cancelButtonName;
	private List<FieldHeaderVO> fieldHeaders;
	private List<String> fieldHeadersNameList;
	private List<Map<String, Object>> fieldValues;
}
