package com.yorosis.yoroapps.grid.vo;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableData {
	private List<Map<String, Object>> data;
	private String totalRecords;
}
