package com.yorosis.yoroflow.models.appwidgets;

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
public class DashboardVO {
	private UUID id;
	private String dashboardName;
	private String dashbaordId;
	private UUID userId;
	private List<DashboardWidgetVO> dashboardWidgets;
	private List<String> dashboardNameList;
}
