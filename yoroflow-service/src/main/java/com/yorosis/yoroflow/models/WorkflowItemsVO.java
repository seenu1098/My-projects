package com.yorosis.yoroflow.models;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowItemsVO {
	private List<ProcessDefinitionVO> manualList;
	private List<ProcessDefinitionVO> scheduleList;
	private List<ProcessDefinitionVO> webServiceList;
}
