package com.yorosis.yoroflow.models.appwidgets;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlotPointAndColorVO {
	private Long y;
	private String color;
}
