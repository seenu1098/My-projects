package com.yorosis.yoroapps.grid.vo;

import org.hibernate.annotations.Columns;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Grid {


	private String id;
	private String moduleId;
	private Integer width;
	private Boolean filterable;
	private Columns columns;
	private int defaultNoOfRows;
}
