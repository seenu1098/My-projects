package com.yorosis.livetester.controller;

import java.io.IOException;
import java.text.ParseException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.grid.services.CommonService;
import com.yorosis.livetester.grid.services.GridService;
import com.yorosis.livetester.grid.vo.GridVO;
import com.yorosis.livetester.grid.vo.HeadersVO;
import com.yorosis.livetester.grid.vo.PaginationVO;
import com.yorosis.livetester.grid.vo.TableData;

@CrossOrigin
@RestController
@RequestMapping("/grid-service/v1/grid")
public class GridController {

	@Autowired
	private GridService gridService;
	
	@Autowired
	private CommonService commonService;

	@GetMapping("/get-headers/{id}")
	public HeadersVO getHeader(@PathVariable(name = "id") String gridId) {
		return gridService.getGridHeaders(gridId);
	}

	@PostMapping("/get-grid-data")
	public TableData getGridDataWithPagination(@RequestBody PaginationVO paginationInfo) throws  IOException, YorosisException, ParseException {
		return gridService.getGridData(paginationInfo);
	}
	
	@GetMapping("/get-width/{id}")
	public Integer getGridWidth(@PathVariable(name = "id") String gridId) {
		return commonService.getGridWidth(gridId);
	}
	@GetMapping("/get-filter/{id}")
	public Boolean getGridCheckbox(@PathVariable(name = "id") String gridId) {
		return commonService.getGridFilterable(gridId);
	}

	@GetMapping("/get/{id}")
	public GridVO getGridDetails(@PathVariable(name = "id") String gridId) {
		return commonService.getGridDetails(gridId);
		
	}
}
