package com.yorosis.yoroapps.vo;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowNamesListVo {
	private UUID processDefinitionId;
	private String processDefinitionName;
	private Long processDefinitionVersion;
}
