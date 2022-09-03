package com.yorosis.taskboard.models;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskboardColumnsVO {
	private UUID id;
	private String columnName;
	private Long columnOrder;
	private String formId;
	private Long version;
	private String columnColor;
	private String layoutType;
	private Boolean isColumnBackground;
	private ResolveSecurityForTaskboardVO taskboardColumnSecurity;
	private List<SubStatusVO> subStatus;
	private List<UserFieldVO> userFieldList;
	private int taskCount;
	private Boolean isDoneColumn;
}
