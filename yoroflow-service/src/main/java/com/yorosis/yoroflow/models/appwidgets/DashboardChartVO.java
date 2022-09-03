package com.yorosis.yoroflow.models.appwidgets;

import java.time.LocalDateTime;
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
public class DashboardChartVO {
	private List<UUID> workspaceIdList;
	private List<UUID> taskboardIdList;
	private LocalDateTime startDate;
	private LocalDateTime endDate;
	private String priority;
	private String filterType;
}
