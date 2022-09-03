package com.yorosis.yoroflow.models;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdhocTask {
	private UUID taskID;
	private String taskName;
	private String status;
	private UUID assignee;

	private String dueDate;

	private String description;
	private List<TaskFilesVO> taskFiles;
	private List<TaskNotesVO> taskNotes;
	private String notes;
	private UUID notesId;
}
