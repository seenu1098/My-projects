package com.yorosis.taskboard.models.sprint;

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
public class WorkLogVo {
	private UUID workLogId;
	private UUID userId;
	private UUID sprintTaskId;
	private String description;
	private Timestamp workDate;
	private Float timespent;
	private Timestamp loggedatTime;
	private String userName;
}
