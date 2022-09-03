package com.yorosis.yoroapps.grid.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeadersVO {
	private List<HeaderVO> headers;
	private boolean checkboxEnabled;
	private boolean filterEnabled;
	private boolean exportEnabled;

	private int tableWidth;
	private int defaultPageSize;
	private String defaultSortColumn;

}