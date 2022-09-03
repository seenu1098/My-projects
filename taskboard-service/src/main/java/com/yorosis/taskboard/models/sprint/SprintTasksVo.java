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
public class SprintTasksVo {
	private UUID sprintId;
	private UUID sprintTaskId;
	private int sprintEstimatedPoints;
	private float sprintEstimatedHours;
	private float sprintTotalHoursSpent;
	private List<UUID> taskboardTaskId;
}
