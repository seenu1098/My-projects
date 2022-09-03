package com.yorosis.livetester.grid.services;

import java.io.IOException;
import java.text.ParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.grid.vo.HeadersVO;
import com.yorosis.livetester.grid.vo.PaginationVO;
import com.yorosis.livetester.grid.vo.TableData;

@Service
public class GridService {

	private Map<String, AbstractGridDataService> gridDataServiceMap = new HashMap<>();

	@Autowired
	private CommonService commonService;

	@Autowired
	public void setAbstractGridDataService(List<AbstractGridDataService> list) {
		for (AbstractGridDataService abstractGridDataService : list) {

			gridDataServiceMap.put(abstractGridDataService.getGridModuleId(), abstractGridDataService);
		}
	}

	public HeadersVO getGridHeaders(String gridId) {
		return commonService.getGridHeaders(gridId);
	}

	public TableData getGridData(PaginationVO paginationInfo) throws IOException, YorosisException, ParseException {
		String moduleId = commonService.getGridModule(paginationInfo.getGridId());
		AbstractGridDataService gridDataService = gridDataServiceMap.get(moduleId);
		return gridDataService.getGridData(paginationInfo);
	}

}
