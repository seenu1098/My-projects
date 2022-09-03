package com.yorosis.yoroflow.models;

import com.fasterxml.jackson.databind.JsonNode;

public interface TaskboardEntityVO {

	String getTaskboardId();

	String getTaskboardName();

	String getTaskboardDescription();

	String getGeneratedTaskId();

	String getSprintEnabled();

	String getTaskName();

	String getTaskboardKey();

	String getTaskboardIsColumnBackground();

	String getLabelName();

	String getLabelColor();

	String getTaskboardLabelId();

	String getColumnName();

	Long getColumnOrder();

	String getFormId();

	String getTaskboardColumnId();

	Long getVersion();

	String getColumnColor();

	String getLayoutType();

	String getIsColumnBackground();

	String getSubStatusColumnId();

	String getSubStatusName();

	String getSubStatusColor();

	String getSubStatusId();

	Long getSubStatusColumnOrder();

	String getUserId();

	String getLaunchButtonName();
	
	String getInitialMapData();
	
	String getIsDoneColumn();

}
