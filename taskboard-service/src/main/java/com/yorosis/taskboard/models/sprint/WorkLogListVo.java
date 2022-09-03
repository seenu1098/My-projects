package com.yorosis.taskboard.models.sprint;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class WorkLogListVo {
	private Integer totalRecords;
	private UUID taskId;
	private List<WorkLogVo> workLogVoList;
}
