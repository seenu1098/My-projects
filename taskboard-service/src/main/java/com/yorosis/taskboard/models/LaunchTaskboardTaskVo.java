package com.yorosis.taskboard.models;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class LaunchTaskboardTaskVo {
	private Integer totalRecords;
	private List<LaunchTaskListVo> taskVOList;
}
