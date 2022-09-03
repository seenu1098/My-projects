package com.yorosis.yoroflow.models.sprint;

import java.sql.Timestamp;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class SprintsVO {
	private UUID sprintId;
	private UUID sprintSettingsId;
	private String sprintName;
	private String sprintStatus;
	private String sprintStartDay;
	private Integer sprintSeqNumber;
	private Integer sprintCounts;
	private Integer sprintTotalOriginalPoints;
	private Double sprintTotalEstimatedHours;
	private Double sprintTotalWorkedHours;
	private Timestamp sprintStartDate;
	private Timestamp sprintEndDate;
	private String response;
}
