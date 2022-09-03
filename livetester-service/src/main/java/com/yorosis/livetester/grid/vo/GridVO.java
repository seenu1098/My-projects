package com.yorosis.livetester.grid.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GridVO {
	private String gridId;
	private String moduleId;
	private int widthPercentage;
	private boolean filterable;

}
