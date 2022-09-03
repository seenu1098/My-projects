package com.yorosis.yoroapps.automation;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder

public class TaskInfo extends BaseAutomationInfo {
	private String taskKey;
	private String taskName;
	private UUID taskId;
	private UUID taskBoardId;
	private String taskBoardName;
	private LabelEventPayload eventPayload;
	private List<UUID> listOfAssignedUsers;
	private String status;
	private String emailTemplateId;
	private Map<String, String> templateKeys;
	private JsonNode oldTaskData;
	private JsonNode newTaskData;
}


