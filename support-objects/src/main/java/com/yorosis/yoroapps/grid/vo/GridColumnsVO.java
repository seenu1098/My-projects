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
public class GridColumnsVO {
	private UUID id;
	private String columnName;
	private String displayName;
	private String sortable;
	private Integer widthPercentage;
	private String filterable;
	private String fieldType;
	private String hiddenValue;
	private Integer columnSequenceNo;
	private String defaultSortableColumn;
	private String dateTimeFormat;
}
