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
public class WorkspaceDetailsVo {
	private List<WorkflowNamesVO> workflowNamesVOList;
	private List<TaskboardNamesVO> taskboardNamesVOList;
	private List<YorDocsNamesVo> yorDocsNamesVoList;
}
