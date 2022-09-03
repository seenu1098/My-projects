package com.yorosis.taskboard.models;

import java.sql.Timestamp;

public interface TaskEntityVO {
	String getColumnOrder();

	String getColumnName();

	String getId();

	String getTaskboardId();

	Timestamp getStartDate();

	Timestamp getDueDate();

	String getStatus();

	String getTaskName();

	String getTaskType();

	String getParentTaskId();

	String getTaskId();

	String getDescription();

	Long getSequenceNo();

	String getSubStatus();

	String getPreviousStatus();

	String getPriority();

	String getCreatedBy();

	Timestamp getCreatedOn();

	String getModifiedBy();

	Timestamp getModifiedOn();

	String getCommentId();

	String getCommentsTaskId();

	String getFilesId();

	String getFilesTaskId();

	String getLabelName();

	String getLabelId();

	String getLabelColor();

	String getTaskLabelId();

	String getAssignedId();

	String getUserId();

	String getTaskData();

	String getFirstName();

	String getLastName();

	String getColor();
}
