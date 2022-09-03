package com.yorosis.yoroapps.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DBDataVO {
	private String tableName;
	private String keyColumnName;
	private String descriptionColumnName;
	private String autoCompleteColumnName;
	private List<SortByVO> sortBy;
	private String joinClause;
	private List<FilterVO> filters;
	private String filterValue;
	private Boolean loadFirstOption;
	private Boolean sortOption;
}
