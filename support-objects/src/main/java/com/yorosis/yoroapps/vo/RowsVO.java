package com.yorosis.yoroapps.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class RowsVO {

	private int row;
	private int rowWidth;
	private String layoutDirection;
	private String layoutResponsiveDirection;
	private int layoutGap;
	private int totalColumns;
	private String alignment;
	private List<FieldConfigVO> columns;
	private String rowBackground;
	private String style;

}
