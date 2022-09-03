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
public class DashboardSwapVo {
	private UUID widgetId;
	private Long rownum;
	private Long columnum;
}
