package com.yorosis.yoroflow.models.landingpage;

import java.time.LocalDateTime;
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
public class LandingPageTaskBoardVO {
	private UUID id;
	private UUID taskboardId;
	private String taskId;
	private String taskName;
	private LocalDateTime createdDate;
	private LocalDateTime dueDate;
	private String boardName;
	private String subtasks;
	private String taskboardKey;
	private String commentsCount;
	private String filesCount;
	private String status;
	private String subStatus;
	private String statusColor;
	private String subStatusColor;
	private List<String> assignedTo;
	private UUID workspaceId;
}
