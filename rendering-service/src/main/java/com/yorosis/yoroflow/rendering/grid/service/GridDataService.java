package com.yorosis.yoroflow.rendering.grid.service;

import java.text.ParseException;
import java.text.SimpleDateFormat;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.persistence.Query;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.GridColumns;
import com.yorosis.yoroapps.entities.GridFilter;
import com.yorosis.yoroapps.entities.Grids;
import com.yorosis.yoroapps.grid.vo.PaginationVO;
import com.yorosis.yoroapps.grid.vo.TableData;
import com.yorosis.yoroapps.vo.FilterValueVO;
import com.yorosis.yoroflow.rendering.constants.YoroappsConstants;
import com.yorosis.yoroflow.rendering.exception.YoroappsException;
import com.yorosis.yoroflow.rendering.repository.GridsRepository;
import com.yorosis.yoroflow.rendering.service.SystemVariableService;

@Service
public class GridDataService {

	@Autowired
	private GridsRepository gridsRepository;

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private GridCommonService gridCommonService;

	@Autowired
	private SystemVariableService systemVariableService;

	private SimpleDateFormat format = new SimpleDateFormat("dd MMMM yyyy");

	@Transactional
	public TableData getGridData(PaginationVO paginationInfo) throws YoroappsException, ParseException {
		Grids grid = gridsRepository.findByGridName(paginationInfo.getGridId());

		if (grid == null) {
			grid = gridCommonService.getGrid(paginationInfo.getGridId());
		}
		if (grid == null) {
			throw new YoroappsException(String.format("Invalid grid id [%s]", paginationInfo.getGridId()));
		}

		String tableNames = grid.getModuleName();
		Set<GridColumns> gridColumns = grid.getGridColumns();

		StringBuilder builder = new StringBuilder();

		List<GridColumns> gridColumnsList = new ArrayList<>();
		Map<String, GridColumns> columnNameGridMap = new HashMap<>();

		int columnSeqIndex = 1;

		StringBuilder columnsBuilder = new StringBuilder();
		for (GridColumns column : gridColumns) {
			if (StringUtils.equalsIgnoreCase(column.getActiveFlag(), YoroappsConstants.YES)) {
				if (columnsBuilder.length() > 0) {
					columnsBuilder.append(", ");
				}
				if (StringUtils.equals(column.getFieldType(), "uuid")) {
					columnsBuilder.append("cast(" + column.getColumnName() + " as varchar)");
				} else {
					columnsBuilder.append(column.getColumnName());
				}
				columnsBuilder.append(" col").append(columnSeqIndex++);

				gridColumnsList.add(column);
				columnNameGridMap.put(column.getColumnName(), column);
			}
		}

		StringBuilder whereBuilder = new StringBuilder();
		if (StringUtils.isNotBlank(grid.getWhereClause())) {
			whereBuilder.append(grid.getWhereClause()).append(" ");
		}

		if (StringUtils.equals(grid.getUserSpecificGridData(), YoroappsConstants.YES)) {
			if (whereBuilder.length() != 0) {
				whereBuilder.append("AND").append(" ");
			}
			String resolvedValue = systemVariableService.resolveSystemVariable(grid.getFieldValues());
			whereBuilder.append(grid.getGridColumnNames() + " = '" + resolvedValue + "'").append(" ");
		}

		List<Object> filterValuesList = new ArrayList<>();

		Set<GridFilter> filter = grid.getGridFilter();
		List<GridFilter> permanentFilterList = filter.stream()
				.filter(p -> StringUtils.equalsIgnoreCase(p.getFilterType(), "P")).collect(Collectors.toList());
		if (permanentFilterList != null && !permanentFilterList.isEmpty()) {
			// Change the total records to Long
			// Add where clause when there are multiple tables (Grids g, grid_columns c
			// where c.grid_id = g.id)
			populateFilterData(whereBuilder, filterValuesList, permanentFilterList, columnNameGridMap);
		}

		FilterValueVO[] currentFilterList = paginationInfo.getFilterValue();
		if (currentFilterList != null && currentFilterList.length > 0) {
			List<GridFilter> reconstructedCurrentFilterList = new ArrayList<>();
			for (FilterValueVO filterValueVO : currentFilterList) {
				if (StringUtils.isNoneBlank(filterValueVO.getFilterIdColumn(), filterValueVO.getFilterIdColumnValue(),
						filterValueVO.getOperators())) {
					reconstructedCurrentFilterList.add(GridFilter.builder().activeFlag(YoroappsConstants.YES)
							.filterName(filterValueVO.getFilterIdColumn())
							.filterValue(filterValueVO.getFilterIdColumnValue()).operator(filterValueVO.getOperators())
							.build());
				}
			}
			populateFilterData(whereBuilder, filterValuesList, reconstructedCurrentFilterList, columnNameGridMap);
		} else {
			List<GridFilter> globalFilterList = filter.stream()
					.filter(p -> p != null && StringUtils.equalsIgnoreCase(p.getFilterType(), "G"))
					.collect(Collectors.toList());
			populateFilterData(whereBuilder, filterValuesList, globalFilterList, columnNameGridMap);
		}

		builder.append(" from ").append(tableNames);

		if (whereBuilder.length() > 0) {
			builder.append(" where ").append(whereBuilder);
		}

		// Get the total page count
		StringBuilder pageCountBuilder = new StringBuilder();
		pageCountBuilder.append("select count(1) ").append(builder);

		Query pageCountQuery = entityManager.createNativeQuery(pageCountBuilder.toString());
		int pageCountIndex = 1;
		for (Object value : filterValuesList) {
			pageCountQuery.setParameter(pageCountIndex++, value);
		}
		Object pageCountResult = pageCountQuery.getSingleResult();

		if (StringUtils.isBlank(paginationInfo.getColumnName())
				&& StringUtils.isNotBlank(grid.getDefaultSortableColumn())) {
			paginationInfo.setColumnName(grid.getDefaultSortableColumn());

			if (StringUtils.isBlank(grid.getSortDirection())) {
				paginationInfo.setDirection("asc");
			} else {
				paginationInfo.setDirection(grid.getSortDirection());
			}
		}

		if (StringUtils.isNotBlank(paginationInfo.getColumnName())
				&& StringUtils.isNotBlank(paginationInfo.getDirection())) {
			GridColumns columns = columnNameGridMap.get(paginationInfo.getColumnName());
			if (columns != null) {
				StringBuilder orderByBuilder = new StringBuilder();
				orderByBuilder.append(" ORDER BY ").append(columns.getColumnName()).append(" ")
						.append(paginationInfo.getDirection()).append(" ");

				builder.append(" ").append(orderByBuilder);
			}
		}

		StringBuilder paginationBuilder = getPaginationQuery(paginationInfo.getIndex(), paginationInfo.getSize(),
				filterValuesList);
		builder.append(" ").append(paginationBuilder);

		StringBuilder finalQuery = new StringBuilder();
		finalQuery.append("select ").append(columnsBuilder).append(builder);

		Query nativeQuery = entityManager.createNativeQuery(finalQuery.toString());
		int index = 1;
		for (Object value : filterValuesList) {
			nativeQuery.setParameter(index++, value);
		}

		@SuppressWarnings("unchecked")
		List<Object[]> resultList = nativeQuery.getResultList();

		List<Map<String, Object>> rowList = new ArrayList<>();
		TableData tableData = TableData.builder().data(rowList).totalRecords("" + pageCountResult).build();

		for (Object[] results : resultList) {
			int columnIndex = 0;
			Map<String, Object> dataMap = new HashMap<>();

			if (BooleanUtils.toBoolean(grid.getShowCheckBox())) {
				dataMap.put("col0", "");
			}

			for (Object value : results) {

				GridColumns gridColumn = gridColumnsList.get(columnIndex);

				if (StringUtils.equalsAnyIgnoreCase(gridColumn.getFieldType(), "date")) {
					dataMap.put("col" + gridColumn.getColumnSequenceNo(), stringToDate(value));
				} else {
					dataMap.put("col" + gridColumn.getColumnSequenceNo(), value);
				}

				columnIndex++;
			}
			rowList.add(dataMap);
		}

		return tableData;
	}

	private String stringToDate(Object date) throws ParseException {
		if (date != null) {
			return format.format(date);
		} else {
			return null;
		}
	}

	private StringBuilder getPaginationQuery(int pageNo, int size, List<Object> filterValuesList) {
		size = size <= 0 ? 10 : size;
		pageNo = (pageNo < 1) ? 1 : pageNo + 1;

		StringBuilder paginationBuilder = new StringBuilder();
		paginationBuilder.append(" LIMIT ?");
		filterValuesList.add(size <= 0 ? 10 : size);

		if (pageNo > 1) {
			paginationBuilder.append(" OFFSET ? ");
			filterValuesList.add(size * (pageNo - 1));
		}

		return paginationBuilder;
	}

	private void populateFilterData(StringBuilder whereBuilder, List<Object> filterValuesList,
			List<GridFilter> filterList, Map<String, GridColumns> columnNameGridMap) throws ParseException {
		for (GridFilter gridFilter : filterList) {
			if (whereBuilder.length() > 0) {
				whereBuilder.append(" and ");
			}

			GridColumns gridColumn = columnNameGridMap.get(gridFilter.getFilterName());
			boolean isCaseInsensitive = isString(gridColumn)
					&& StringUtils.equalsAnyIgnoreCase(gridFilter.getOperator(), "bw", "ew", "cn");

			whereBuilder.append(isCaseInsensitive ? "lower(" : "").append(gridFilter.getFilterName())
					.append(isCaseInsensitive ? ")" : "");
			whereBuilder.append(getOperator(gridFilter.getOperator()));
			whereBuilder.append(" ? ");
			filterValuesList.add(getOperand(gridFilter.getOperator(), gridFilter.getFilterValue(), gridColumn));
		}
	}

	private boolean isString(GridColumns gridColumn) {
		return (gridColumn != null && StringUtils.equalsAnyIgnoreCase(gridColumn.getFieldType(), "text", "string"));
	}

	private Object getOperand(String operator, String filterValue, GridColumns gridColumn) throws ParseException {
		if (isString(gridColumn)) {
			switch (operator.toLowerCase().trim()) {
			case "bw":
				filterValue = filterValue.toLowerCase() + '%';
				break;
			case "ew":
				filterValue = '%' + filterValue.toLowerCase();
				break;
			case "cn":
				filterValue = '%' + filterValue.toLowerCase() + '%';
				break;
			default:
			}
		}

		return getValue(gridColumn, filterValue);
	}

	private Object getValue(GridColumns gridColumn, String value) throws ParseException {
		Object newValue = value;

		if (gridColumn != null && value != null && StringUtils.isNotBlank(gridColumn.getFieldType())) {

			if (StringUtils.equalsIgnoreCase(gridColumn.getFieldType(), "date")) {
				newValue = format.parse(value);
			} else if (StringUtils.equalsAnyIgnoreCase(gridColumn.getFieldType(), "long", "number")) {
				newValue = Long.parseLong(value);
			} else if (StringUtils.equalsAnyIgnoreCase(gridColumn.getFieldType(), "double", "float")) {
				newValue = Double.parseDouble(value);
			}
		}

		return newValue;
	}

	private String getOperator(String operator) {
		String actualOperator = null;
		switch (operator.toLowerCase().trim()) {
		case "eq":
			actualOperator = " = ";
			break;
		case "ne":
			actualOperator = " != ";
			break;
		case "bw":
		case "ew":
		case "cn":
			actualOperator = " like ";
			break;
		case "gt":
			actualOperator = " > ";
			break;
		case "ge":
			actualOperator = " >= ";
			break;

		case "lt":
			actualOperator = " < ";
			break;

		case "le":
			actualOperator = " <= ";
			break;

		default:
			actualOperator = " = ";
		}

		return actualOperator;
	}
}
