package com.yorosis.yoroflow.models.taskboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskCountVo {
	private String status;
	private Integer count;

}
