package com.yorosis.yoroflow.models;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessInstanceTaskNotesVO {
	private UUID processInstanceTaskId;
	private UUID taskNotesAttId;
	private String notes;
	private UUID addedBy;
	private String userName;
	private Timestamp creationTime;
	private Timestamp modifiedOn;
	private UUID parentNotesId;
	private List<ProcessInstanceTaskNotesVO> taskNotes;
	private int taskNotesLength;
	private List<String> mentionedUsersEmail;
	private List<UUID> mentionedUsersId;
}
