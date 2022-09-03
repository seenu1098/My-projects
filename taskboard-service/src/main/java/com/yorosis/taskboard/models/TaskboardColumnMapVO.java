package com.yorosis.taskboard.models;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskboardColumnMapVO {
	private TaskboardColumnsVO taskboardColumnsVO;
	private List<TaskboardTaskVO> taskboardTaskVOList;
}
