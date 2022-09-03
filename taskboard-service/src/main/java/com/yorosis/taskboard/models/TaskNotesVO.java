package com.yorosis.taskboard.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskNotesVO {
	private UUID notesId;
	private String notes;
	private String updatedBy;
	private String updatedDate;
}
