package com.yorosis.yoroflow.rendering.grid.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.GridColumns;
import com.yorosis.yoroapps.entities.GridFilter;
import com.yorosis.yoroapps.entities.Grids;
import com.yorosis.yoroapps.grid.vo.HeaderVO;
import com.yorosis.yoroapps.grid.vo.HeadersVO;
import com.yorosis.yoroflow.rendering.constants.YoroappsConstants;
import com.yorosis.yoroflow.rendering.repository.GridColumnRepository;
import com.yorosis.yoroflow.rendering.repository.GridsRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class GridCommonService {
	private static final String FALSE = "false";

	@Autowired
	private GridsRepository gridsRepository;

	@Autowired
	private GridColumnRepository gridColumnRepository;

	@Transactional
	public HeadersVO getGridHeaders(String gridId) {
		Grids grid = getGrid(gridId);
		if (grid == null) {
			throw new IllegalArgumentException(String.format("No grid list available for grid name [%s]", gridId));
		}

		List<HeaderVO> headers = new ArrayList<>();
		HeadersVO headersVo = HeadersVO.builder().defaultPageSize(grid.getDefaultNoOfRows())
				.defaultSortColumn(grid.getDefaultSortableColumn()).checkboxEnabled(getBoolean(grid.getShowCheckBox()))
				.exportEnabled(getBoolean(grid.getExportable())).filterEnabled(getBoolean(grid.getFilterable()))
				.tableWidth(grid.getWidthPercentage() <= 0 ? 100 : grid.getWidthPercentage()).headers(headers).build();

		List<GridColumns> gridColumnsList = gridColumnRepository.getGridColumns(gridId, YoroappsConstants.YES,
				YorosisContext.get().getTenantId());
		if (BooleanUtils.toBoolean(grid.getShowCheckBox())) {
			GridColumns gridColumn = GridColumns.builder().columnSequenceNo(0).fieldType("string").columnName("select")
					.displayName("select").filterable(FALSE).hiddenValue(FALSE).sortable(FALSE).widthPercentage(2)
					.build();
			gridColumnsList.add(0, gridColumn);
		}

		for (GridColumns gridColumn : gridColumnsList) {
			HeaderVO headerVo = HeaderVO.builder().columnSeqNo(gridColumn.getColumnSequenceNo())
					.fieldDataType(gridColumn.getFieldType()).headerId(gridColumn.getColumnName())
					.headerName(gridColumn.getDisplayName()).filterable(getBoolean(gridColumn.getFilterable()))
					.hidden(getBoolean(gridColumn.getHiddenValue())).sortable(getBoolean(gridColumn.getSortable()))
					.enabled(true).widthPercentage(gridColumn.getWidthPercentage()).build();

			headers.add(headerVo);
		}

		return headersVo;
	}

	private boolean getBoolean(String value) {
		return BooleanUtils.toBoolean(value);
	}

	public Grids getGrid(String gridId) {
		Grids grid = gridsRepository.getGrid(gridId, YoroappsConstants.YES, YorosisContext.get().getTenantId());

		if (grid != null) {
			Set<GridColumns> list = grid.getGridColumns().stream()
					.filter(p -> StringUtils.equalsIgnoreCase(YoroappsConstants.YES, p.getActiveFlag()))
					.collect(Collectors.toSet());
			grid.setGridColumns(list);

			Set<GridFilter> filterSet = grid.getGridFilter().stream()
					.filter(p -> StringUtils.equalsIgnoreCase(YoroappsConstants.YES, p.getActiveFlag()))
					.collect(Collectors.toSet());
			grid.setGridFilter(filterSet);

			return grid;
		}

		throw new IllegalArgumentException(String.format("No grid list available [%s]", gridId));
	}

	public String getGridModule(String gridId) {
		return getGrid(gridId).getModuleName();
	}
}
