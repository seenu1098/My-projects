package com.yorosis.yoroflow.models.appwidgets;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WidgetFiltersVo {
	private String filterType;
	private List<String> filterValue;
}
