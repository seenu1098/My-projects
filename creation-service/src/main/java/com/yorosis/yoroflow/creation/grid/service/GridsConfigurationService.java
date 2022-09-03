package com.yorosis.yoroflow.creation.grid.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.entities.GridColumns;
import com.yorosis.yoroapps.entities.GridFilter;
import com.yorosis.yoroapps.entities.Grids;
import com.yorosis.yoroapps.grid.vo.GridColumnsVO;
import com.yorosis.yoroapps.grid.vo.GridFilterVO;
import com.yorosis.yoroapps.grid.vo.GridVO;
import com.yorosis.yoroapps.vo.FieldVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.repository.GridColumnRepository;
import com.yorosis.yoroflow.creation.repository.GridFilterRepository;
import com.yorosis.yoroflow.creation.repository.GridsRepository;
import com.yorosis.yoroflow.creation.service.SystemVariableService;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class GridsConfigurationService {

	@Autowired
	private GridsRepository gridsRepository;

	@Autowired
	private GridColumnRepository gridColumnRepository;

	@Autowired
	private GridFilterRepository gridFilterRepository;

	@Autowired
	private SystemVariableService systemVariableService;

	private String booleanToChar(boolean value) {
		return value ? YoroappsConstants.YES : YoroappsConstants.NO;
	}

	private boolean charToBoolean(String value) {
		return StringUtils.equalsIgnoreCase(YoroappsConstants.YES, value);
	}

	private GridColumns constructVOToDTOGridColumns(GridColumnsVO gridColmnsVO) {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());

		return GridColumns.builder().columnName(gridColmnsVO.getColumnName()).displayName(gridColmnsVO.getDisplayName())
				.widthPercentage(gridColmnsVO.getWidthPercentage()).filterable(gridColmnsVO.getFilterable()).fieldType(gridColmnsVO.getFieldType())
				.sortable(gridColmnsVO.getSortable()).dateTimeFormat(gridColmnsVO.getDateTimeFormat()).columnSequenceNo(gridColmnsVO.getColumnSequenceNo())
				.hiddenValue(gridColmnsVO.getHiddenValue()).tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
				.createdOn(currentTimestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(currentTimestamp).activeFlag(YoroappsConstants.YES)
				.build();
	}

	private Grids constructVOTODTOGrids(GridVO gridVO) {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());

		Grids grids = Grids.builder().gridName(gridVO.getGridName()).moduleName(gridVO.getModuleName()).widthPercentage(gridVO.getWidthPercentage())
				.tenantId(YorosisContext.get().getTenantId()).filterable(gridVO.getFilterable()).createdBy(YorosisContext.get().getUserName())
				.createdOn(currentTimestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(currentTimestamp).gridUrl(gridVO.getGridUrl())
				.defaultSortableColumn(gridVO.getDefaultSortableColumn()).passParams(gridVO.getPassParams()).showCheckBox(gridVO.getShowCheckBox())
				.defaultNoOfRows(gridVO.getDefaultNoOfRows()).exportable(gridVO.getExportable()).sortDirection(gridVO.getSortDirection())
				.activeFlag(YoroappsConstants.YES).managedFlag(YoroappsConstants.NO).fieldValues(gridVO.getFieldValues())
				.gridColumnNames(gridVO.getGridColumnNames()).build();

		if (gridVO.getUserSpecificGridData() != null && BooleanUtils.isTrue(gridVO.getUserSpecificGridData())) {
			grids.setUserSpecificGridData(booleanToChar(gridVO.getUserSpecificGridData()));
			grids.setFieldValues(gridVO.getFieldValues());
			grids.setGridColumnNames(gridVO.getGridColumnNames());
		}
		return grids;
	}

	private GridVO constructDTOToVOGridVO(Grids grids) {
		return GridVO.builder().gridId(grids.getGridId()).gridName(grids.getGridName()).moduleName(grids.getModuleName())
				.widthPercentage(grids.getWidthPercentage()).filterable(grids.getFilterable()).gridUrl(grids.getGridUrl()).passParams(grids.getPassParams())
				.showCheckBox(grids.getShowCheckBox()).defaultSortableColumn(grids.getDefaultSortableColumn()).defaultNoOfRows(grids.getDefaultNoOfRows())
				.exportable(grids.getExportable()).sortDirection(grids.getSortDirection()).userSpecificGridData(charToBoolean(grids.getUserSpecificGridData()))
				.fieldValues(grids.getFieldValues()).gridColumnNames(grids.getGridColumnNames()).build();
	}

	private GridColumnsVO constructDTOToVOGridColumnsVO(GridColumns gridColumns) {
		return GridColumnsVO.builder().id(gridColumns.getId()).columnName(gridColumns.getColumnName()).widthPercentage(gridColumns.getWidthPercentage())
				.displayName(gridColumns.getDisplayName()).fieldType(gridColumns.getFieldType()).filterable(gridColumns.getFilterable())
				.hiddenValue(gridColumns.getHiddenValue()).sortable(gridColumns.getSortable()).columnSequenceNo(gridColumns.getColumnSequenceNo())
				.dateTimeFormat(gridColumns.getDateTimeFormat()).build();
	}

	private GridFilter constructGridFilterVOTODTO(GridFilterVO vo) {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());

		return GridFilter.builder().filterName(vo.getFilterName()).filterType(vo.getFilterType()).filterValue(vo.getFilterValue()).operator(vo.getOperator())
				.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName()).createdOn(currentTimestamp)
				.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(currentTimestamp).activeFlag(YoroappsConstants.YES).build();
	}

	private GridFilterVO constructGridFilterDTOTOVO(GridFilter filter) {
		return GridFilterVO.builder().filterId(filter.getFilterId()).filterName(filter.getFilterName()).filterType(filter.getFilterType())
				.filterValue(filter.getFilterValue()).operator(filter.getOperator()).build();
	}

	@Transactional
	public ResponseStringVO saveAndUpdateGridData(GridVO gridVO) {
		String message = null;
		Grids grids = null;
		Set<GridColumns> gridColumnsList = new HashSet<>();
		Set<GridFilter> gridFiltersList = new HashSet<>();

		deleteGridColumnsAndFilters(gridVO);

		if (gridVO.getGridId() == null) {

			grids = constructVOTODTOGrids(gridVO);

			for (GridColumnsVO gridCoulmnsVO : gridVO.getGridColumns()) {
				GridColumns gridColumns = constructVOToDTOGridColumns(gridCoulmnsVO);
				gridColumns.setGrids(grids);
				gridColumnsList.add(gridColumns);
			}

//			if (!gridVO.getPermanentFilterColumns().isEmpty()) {
//				for (GridFilterVO gridPermanentFilterVO : gridVO.getPermanentFilterColumns()) {
//					GridFilter gridFilter = constructGridFilterVOTODTO(gridPermanentFilterVO);
//					gridFilter.setGrids(grids);
//					gridFiltersList.add(gridFilter);
//				}
//			}
//
//			if (!gridVO.getGlobalFilterColumns().isEmpty()) {
//				for (GridFilterVO gridGlobalFilterVO : gridVO.getGlobalFilterColumns()) {
//					GridFilter gridFilter = constructGridFilterVOTODTO(gridGlobalFilterVO);
//					gridFilter.setGrids(grids);
//					gridFiltersList.add(gridFilter);
//				}
//			}

			grids.setGridColumns(gridColumnsList);
			grids.setGridFilter(gridFiltersList);
			grids.setActiveFlag(YoroappsConstants.YES);
			message = "Grid Data saved successfully";

		} else {
			grids = gridsRepository.getOne(gridVO.getGridId());
			updateGridColumns(gridVO, grids);

			updateFilters(gridVO.getPermanentFilterColumns(), grids);
			updateFilters(gridVO.getGlobalFilterColumns(), grids);

			message = "Grid Data updated successfully";
		}

		gridsRepository.save(grids);
		return ResponseStringVO.builder().response(message).build();
	}

	private void deleteGridColumnsAndFilters(GridVO gridVO) {
		if (gridVO.getDeletedColumnIDList() != null && !gridVO.getDeletedColumnIDList().isEmpty()) {
			for (UUID id : gridVO.getDeletedColumnIDList()) {
				GridColumns column = gridColumnRepository.getOne(id);
				column.setActiveFlag(YoroappsConstants.NO);
				gridColumnRepository.save(column);
			}
		}

//		if (!gridVO.getDeletedPermanentFilterIdList().isEmpty()) {
//			for (Long id : gridVO.getDeletedPermanentFilterIdList()) {
//				GridFilter filter = gridFilterRepository.findByFilterIdAndActiveFlag(id, YoroappsConstants.YES);
//				filter.setActiveFlag(YoroappsConstants.NO);
//				gridFilterRepository.save(filter);
//			}
//		}
//
//		if (!gridVO.getDeletedGlobalFilterIdList().isEmpty()) {
//			for (Long id : gridVO.getDeletedGlobalFilterIdList()) {
//				GridFilter filter = gridFilterRepository.findByFilterIdAndActiveFlag(id, YoroappsConstants.YES);
//				filter.setActiveFlag(YoroappsConstants.NO);
//				gridFilterRepository.save(filter);
//			}
//		}
	}

	private void updateGridColumns(GridVO gridVO, Grids grids) {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		grids.setWidthPercentage(gridVO.getWidthPercentage());
		grids.setModifiedBy(YorosisContext.get().getUserName());
		grids.setModifiedOn(currentTimestamp);
		grids.setFilterable(gridVO.getFilterable());
		grids.setGridName(gridVO.getGridName());
		grids.setModuleName(gridVO.getModuleName());
		grids.setWidthPercentage(gridVO.getWidthPercentage());
		grids.setDefaultSortableColumn(gridVO.getDefaultSortableColumn());
		grids.setGridUrl(gridVO.getGridUrl());
		grids.setShowCheckBox(gridVO.getShowCheckBox());
		grids.setPassParams(gridVO.getPassParams());
		grids.setExportable(gridVO.getExportable());
		grids.setDefaultNoOfRows(gridVO.getDefaultNoOfRows());
		grids.setSortDirection(gridVO.getSortDirection());
		if (gridVO.getUserSpecificGridData() != null && BooleanUtils.isTrue(gridVO.getUserSpecificGridData())) {
			grids.setUserSpecificGridData(booleanToChar(gridVO.getUserSpecificGridData()));
			grids.setFieldValues(gridVO.getFieldValues());
			grids.setGridColumnNames(gridVO.getGridColumnNames());
		}

		for (GridColumnsVO columnVO : gridVO.getGridColumns()) {
			GridColumns column = null;
			if (columnVO.getId() != null) {
				column = gridColumnRepository.getOne(columnVO.getId());
				column.setColumnName(columnVO.getColumnName());
				column.setDisplayName(columnVO.getDisplayName());
				column.setSortable(columnVO.getSortable());
				column.setWidthPercentage(columnVO.getWidthPercentage());
				column.setFilterable(columnVO.getFilterable());
				column.setFieldType(columnVO.getFieldType());
				column.setHiddenValue(columnVO.getHiddenValue());
				column.setColumnSequenceNo(columnVO.getColumnSequenceNo());
				column.setDateTimeFormat(columnVO.getDateTimeFormat());
			} else {
				column = constructVOToDTOGridColumns(columnVO);
				column.setGrids(grids);
				column.setActiveFlag(YoroappsConstants.YES);
			}
			gridColumnRepository.save(column);
		}
	}

	private void updateFilters(List<GridFilterVO> filterList, Grids grids) {
		if (filterList == null || grids == null) {
			return;
		}

		for (GridFilterVO filterVO : filterList) {
			GridFilter filter = null;
			if (filterVO.getFilterId() != null) {
				filter = gridFilterRepository.findByFilterIdAndActiveFlagAndTenantIdIgnoreCase(filterVO.getFilterId(), YoroappsConstants.YES,
						YorosisContext.get().getTenantId());
				filter.setFilterName(filterVO.getFilterName());
				filter.setFilterType(filterVO.getFilterType());
				filter.setFilterValue(filterVO.getFilterValue());
				filter.setOperator(filterVO.getOperator());
			} else {
				filter = constructGridFilterVOTODTO(filterVO);
				filter.setGrids(grids);
				filter.setActiveFlag(YoroappsConstants.YES);
			}
			gridFilterRepository.save(filter);
		}
	}

	public static final Comparator<GridColumnsVO> DisplayOrderComparator = new Comparator<GridColumnsVO>() {

		public int compare(GridColumnsVO s1, GridColumnsVO s2) {

			int displayOrder1 = s1.getColumnSequenceNo();
			int displayOrder2 = s2.getColumnSequenceNo();
			return displayOrder1 - displayOrder2;

		}
	};

	@Transactional
	public GridVO getGridInfo(UUID id) {
		Grids grid = gridsRepository.getOne(id);
		return getGridVO(grid);
	}

	public GridVO getGridVO(Grids grid) {
		GridVO gridVO = constructDTOToVOGridVO(grid);

		List<GridColumnsVO> gridColumns = new ArrayList<>();
		List<GridFilterVO> gridPermanentFilters = new ArrayList<>();
		List<GridFilterVO> gridGlobalFilters = new ArrayList<>();
		for (GridColumns columns : grid.getGridColumns()) {
			if (!StringUtils.equals(columns.getActiveFlag(), YoroappsConstants.NO)) {
				gridColumns.add(constructDTOToVOGridColumnsVO(columns));
			}
		}
		Collections.sort(gridColumns, DisplayOrderComparator);
		for (GridFilter filter : grid.getGridFilter()) {
			if (!StringUtils.equals(filter.getActiveFlag(), YoroappsConstants.NO)) {
				if (StringUtils.equals(filter.getFilterType(), "P")) {
					gridPermanentFilters.add(constructGridFilterDTOTOVO(filter));
				} else {
					gridGlobalFilters.add(constructGridFilterDTOTOVO(filter));
				}
			}
		}
		gridVO.setGridColumns(gridColumns);
		gridVO.setGlobalFilterColumns(gridGlobalFilters);
		gridVO.setPermanentFilterColumns(gridPermanentFilters);
		return gridVO;
	}

	@Transactional
	public ResponseStringVO checkGridName(String gridName) {
		Grids grids = gridsRepository.findByGridNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(gridName, YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);
		if (grids != null) {
			return ResponseStringVO.builder().response("Grid Name already exist").build();
		}
		return ResponseStringVO.builder().response("New Name").build();
	}

	@Transactional
	public GridVO getGridInfoByGridName(String gridName) {
		Grids grids = gridsRepository.findByGridNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(gridName, YorosisContext.get().getTenantId(),
				YoroappsConstants.YES);
		if (grids != null) {
			return getGridVO(grids);
		} else {
			return GridVO.builder().build();
		}

	}

	@Transactional
	public Set<FieldVO> getBuitInFields() {
		Set<FieldVO> listFieldVO = new HashSet<>();
		listFieldVO.addAll(systemVariableService.getFieldList());
		return listFieldVO;
	}
}
