package com.yorosis.livetester.service;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.yorosis.livetester.entities.Batch;
import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.grid.services.AbstractGridDataService;
import com.yorosis.livetester.grid.vo.FilterData;
import com.yorosis.livetester.grid.vo.PaginationVO;
import com.yorosis.livetester.grid.vo.TableData;
import com.yorosis.livetester.repo.BatchRepository;

@Service
public class BatchService extends AbstractGridDataService {

	@Autowired
	private BatchRepository batchRepository;

	@Override
	public TableData getGridData(PaginationVO pagination) throws YorosisException, ParseException {
		List<Map<String, String>> list = new ArrayList<>();

		String totalCount = null;
		TableData tableData = null;
		Map<String, String> dataMap = null;

		Pageable pageable = getPageableObject(pagination);

		if (StringUtils.equalsIgnoreCase("batch", pagination.getGridId())) {
			if (pagination.getFilterValue().length == 0) {
				totalCount = batchRepository.getTotalBatchCount();

				Page<Batch> batchList = batchRepository.findAll(pageable);
				for (Batch batch : batchList) {
					dataMap = new HashMap<>();

					dataMap.put("col1", batch.getBatchName());
					dataMap.put("col2", batch.getEnvironment().getEnvironmentName());
					dataMap.put("col3", timeStampToString(batch.getStartTime()));
					dataMap.put("col4", timeStampToString(batch.getEndTime()));
					dataMap.put("col5", batch.getStatus());
					dataMap.put("col6", Long.toString(batch.getTotalTestcases()));
					dataMap.put("col7", Long.toString(batch.getPassPercentage()));
					dataMap.put("col8", Long.toString(batch.getFailPercentage()));
					dataMap.put("col9", Long.toString(batch.getId()));
					list.add(dataMap);
				}

				tableData = TableData.builder().data(list).totalRecords(totalCount).build();

			} else {

				FilterData<Batch> filterData = getFilterData(Batch.class, pagination);

				List<Batch> batchList = filterData.getData();

				tableData = TableData.builder().data(getTableData(batchList)).totalRecords(longToString(filterData.getTotalRecords())).build();
			}
		} else {
			throw new YorosisException("Enter valid Grid Id");
		}

		return tableData;
	}

	private List<Map<String, String>> getTableData(List<Batch> batchList) {
		List<Map<String, String>> list = new ArrayList<>();

		for (Batch batch : batchList) {
			Map<String, String> dataMap = new HashMap<>();

			dataMap.put("col1", batch.getBatchName());
			dataMap.put("col2", batch.getEnvironment().getEnvironmentName());
			dataMap.put("col3", timeStampToString(batch.getStartTime()));
			dataMap.put("col4", timeStampToString(batch.getEndTime()));
			dataMap.put("col5", batch.getStatus());
			dataMap.put("col6", Long.toString(batch.getTotalTestcases()));
			dataMap.put("col7", Long.toString(batch.getPassPercentage()));
			dataMap.put("col8", Long.toString(batch.getFailPercentage()));
			dataMap.put("col9", Long.toString(batch.getId()));
			list.add(dataMap);
		}
		return list;
	}

	@Override
	public String getGridModuleId() {
		return "batch";
	}

	private String timeStampToString(Date dateValue) {
		if (dateValue == null) {
			return "";
		}

		DateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy HH:mm:ss");
		return dateFormat.format(dateValue);
	}

}
