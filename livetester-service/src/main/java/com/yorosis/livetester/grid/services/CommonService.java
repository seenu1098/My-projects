package com.yorosis.livetester.grid.services;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import com.thoughtworks.xstream.XStream;
import com.yorosis.livetester.grid.vo.Column;
import com.yorosis.livetester.grid.vo.Columns;
import com.yorosis.livetester.grid.vo.FilterData;
import com.yorosis.livetester.grid.vo.FilterValueVO;
import com.yorosis.livetester.grid.vo.Grid;
import com.yorosis.livetester.grid.vo.GridList;
import com.yorosis.livetester.grid.vo.GridVO;
import com.yorosis.livetester.grid.vo.HeadersVO;
import com.yorosis.livetester.grid.vo.PaginationVO;
import com.yorosis.livetester.grid.vo.TableData;

@Service
public class CommonService {

	private Map<String, Grid> gridIdMap = new HashMap<>();

	@Value("classpath:grid.xml")
	private Resource resource;

	@PostConstruct
	public void loadGridFile() throws IOException {
		XStream xstream = new XStream();
		XStream.setupDefaultSecurity(xstream);
		xstream.allowTypes(new Class[] { Integer.class, Boolean.class, List.class, GridList.class, Grid.class, Columns.class, Column.class, String.class,
				FilterData.class, FilterValueVO.class, TableData.class, PaginationVO.class, HeadersVO.class });

		xstream.processAnnotations(GridList.class);

		GridList gridList = (GridList) xstream.fromXML(resource.getInputStream());

		List<Grid> grids = gridList.getGrid();
		for (Grid grid : grids) {
			gridIdMap.put(grid.getId().toLowerCase().trim(), grid);
		}
	}

	public HeadersVO getGridHeaders(String gridId) {
		List<String> headers = new ArrayList<>();
		List<String> headersIdList = new ArrayList<>();
		List<Boolean> sortable = new ArrayList<>();
		List<Integer> width = new ArrayList<>();
		List<Boolean> filterable = new ArrayList<>();
		List<String> fieldType = new ArrayList<>();

		Grid grid = gridIdMap.get(gridId.trim().toLowerCase());
		if (grid != null) {
			for (Column column : grid.getColumns().getColumn()) {
				headers.add(column.getDisplayname());
				headersIdList.add(column.getName());
				sortable.add(Boolean.parseBoolean(column.getSortable()));
				width.add(Integer.parseInt(column.getWidth()));
				if (grid.getFilterable() != null && grid.getFilterable().booleanValue()) {
					filterable.add(Boolean.parseBoolean(column.getFilterable()));
				}
				fieldType.add(column.getFieldType());
			}
		}

		return HeadersVO.builder().headers(headers).headersIdList(headersIdList).sortable(sortable).width(width).filterable(filterable).fieldType(fieldType)
				.build();
	}

	public GridVO getGridDetails(String gridId) {
		Grid grid = gridIdMap.get(gridId.trim().toLowerCase());
		return GridVO.builder().widthPercentage(grid.getWidth()).filterable(grid.getFilterable()).build();
	}

	public String getGridModule(String gridId) {
		Grid grid = gridIdMap.get(gridId.trim().toLowerCase());
		if (grid != null) {
			return grid.getModuleId();
		}

		throw new IllegalArgumentException("No grid list available");
	}

	public Integer getGridWidth(String gridId) {
		Grid grid = gridIdMap.get(gridId.trim().toLowerCase());

		if (grid != null) {
			return grid.getWidth();
		}
		throw new IllegalArgumentException("No grid list available");
	}

	public Boolean getGridFilterable(String gridId) {
		Grid grid = gridIdMap.get(gridId.trim().toLowerCase());

		if (grid != null) {
			return grid.getFilterable();
		}
		throw new IllegalArgumentException("No grid list available");
	}

	public Map<String, String> getGridNameObjectFieldMapping(String gridId) {
		Map<String, String> gridNameObjectFieldMap = new LinkedHashMap<>();

		Grid grid = gridIdMap.get(gridId.trim().toLowerCase());
		if (grid != null) {
			int i = 1;
			for (Column column : grid.getColumns().getColumn()) {
				gridNameObjectFieldMap.put("col" + (i++), column.getObjectFieldName());
			}
		}

		return gridNameObjectFieldMap;
	}

}
