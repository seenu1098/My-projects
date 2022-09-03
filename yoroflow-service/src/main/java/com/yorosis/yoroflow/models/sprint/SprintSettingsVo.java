package com.yorosis.yoroflow.models.sprint;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class SprintSettingsVo {
	private UUID sprintSettingsId;
	private UUID taskboardId;
	private String sprintEstimations;
	private String sprintStartDay;
	private String sprintDurationType;
	private int sprintDuration;
}
