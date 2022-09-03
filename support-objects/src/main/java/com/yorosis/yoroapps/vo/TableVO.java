package com.yorosis.yoroapps.vo;

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
public class TableVO {
	private String headerOrientation;
	private String noOfRows;
	private boolean isChildTable;
	private String tableName;
	private String tableId;
	private List<FieldConfigVO> columns;
	private Map<String, FieldConfigVO> fieldMap;
	private EnableRowLevelComputationVO enableRowLevelComputation;
}
