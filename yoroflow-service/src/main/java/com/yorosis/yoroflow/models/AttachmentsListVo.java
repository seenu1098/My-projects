package com.yorosis.yoroflow.models;

import java.sql.Timestamp;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class AttachmentsListVo {
	private UUID attachmentsId;
	private String taskboardName;
	private String taskId;
	private String createdBy;
	private Timestamp createdOn;
	private String fileType;
	private String fileName;
	private String taskboardKey;
	private UUID taskboardId;
}
