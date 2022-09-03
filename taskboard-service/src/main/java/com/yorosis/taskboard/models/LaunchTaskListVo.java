package com.yorosis.taskboard.models;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class LaunchTaskListVo {
	private UUID taskId;
	private UUID instanceId;
	private UUID taskboardTaskId;
	private UUID taskboardId;
	private String reqName;
	private String status;
	private String formId;
	private Long version;
	private LocalDateTime submittedDate;
	private JsonNode jsonData;
	private List<UUID> assignedToUser;
	private List<UUID> assignedToTeam;
}
