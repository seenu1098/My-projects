package com.yorosis.yoroapps.grid.vo;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GridFilterVO {
	private UUID filterId;
	private String filterName;
	private String operator;
	private String filterType;
	private String filterValue;
}
