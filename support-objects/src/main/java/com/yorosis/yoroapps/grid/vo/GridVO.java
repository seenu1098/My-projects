package com.yorosis.yoroapps.grid.vo;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GridVO {
	private UUID gridId;
	private UUID pageId;
	private String gridName;
	private String moduleName;
	private int widthPercentage;
	private String filterable;
	private String gridUrl;
	private String defaultSortableColumn;
	private String showCheckBox;
	private String passParams;
	private Boolean userSpecificGridData;
	private String fieldValues;
	private String gridColumnNames;

	private List<GridColumnsVO> gridColumns;

	private List<GridFilterVO> permanentFilterColumns;
	private List<GridFilterVO> globalFilterColumns;

	private List<UUID> deletedColumnIDList;
	private List<UUID> deletedPermanentFilterIdList;
	private List<UUID> deletedGlobalFilterIdList;

	private int defaultNoOfRows;
	private String exportable;
	private String sortDirection;
}
