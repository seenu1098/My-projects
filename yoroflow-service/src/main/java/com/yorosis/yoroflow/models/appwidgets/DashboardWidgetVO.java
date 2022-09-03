package com.yorosis.yoroflow.models.appwidgets;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardWidgetVO {
	private UUID id;
	private String widgetName;
	private String widgetType;
	private UUID dashboardId;
	private long rownum;
	private long colnum;
}
