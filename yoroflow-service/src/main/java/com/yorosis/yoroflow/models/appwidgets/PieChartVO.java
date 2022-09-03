package com.yorosis.yoroflow.models.appwidgets;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PieChartVO {
	private String name;
	private Double y;
	private String color;
}
