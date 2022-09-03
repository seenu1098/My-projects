package com.yorosis.livetester.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.livetester.entities.BatchTestcases;
import com.yorosis.livetester.entities.BatchTestcasesResult;
import com.yorosis.livetester.grid.services.AbstractGridDataService;
import com.yorosis.livetester.grid.vo.PaginationVO;
import com.yorosis.livetester.grid.vo.TableData;
import com.yorosis.livetester.repo.BatchTestcaseRepository;
import com.yorosis.livetester.repo.BatchTestcaseResultRepository;
import com.yorosis.livetester.vo.BatchTestcaseResultVO;

@Service
public class BatchTestcaseResultService extends AbstractGridDataService {

	@Autowired
	private BatchTestcaseResultRepository batchTestcaseResultRepository;

	@Autowired
	private BatchTestcaseRepository batchTestcaseRepository;

	@Transactional
	public BatchTestcaseResultVO getBatchTestcaseResultData(long id) {
		BatchTestcases batchTestcase = batchTestcaseRepository.findById(id);

		long batchNumber = batchTestcase.getBatch().getId();
		String batchName = batchTestcase.getBatch().getBatchName();
		String testCaseName = batchTestcase.getClaims().getTestcaseName();

		return BatchTestcaseResultVO.builder().batchNumber(batchNumber).batchName(batchName).testCaseName(testCaseName)
				.generateEDI(StringUtils.isNotBlank(batchTestcase.getGeneratedEdi()) ? batchTestcase.getGeneratedEdi().replace("~", "~\n") : "").tcn(batchTestcase.getTcn())
				.pcn(batchTestcase.getPcn()).build();
	}

	@Override
	@Transactional
	public TableData getGridData(PaginationVO pagination) {
		List<Map<String, String>> list = new ArrayList<>();

		String totalCount = "0";

		Pageable pageable = getPageableObject(pagination);
		TableData tableData = TableData.builder().data(list).totalRecords(totalCount).build();

		if (StringUtils.equalsIgnoreCase("batch-testcase-result", pagination.getGridId())
				&& StringUtils.isNotBlank(pagination.getId())) {
			totalCount = batchTestcaseResultRepository.getBatchTestcaseResultCount(Long.parseLong(pagination.getId()));
			tableData.setTotalRecords(totalCount);

			Sort.Order order1 = new Sort.Order(Direction.ASC, "elementsConfiguration.applicableAt");
			Sort.Order order2 = new Sort.Order(Direction.ASC, "seqNo");
			Sort.Order order3 = new Sort.Order(Direction.ASC, "elementsConfiguration.elementLabel");
			
			Sort sort = Sort.by(order1, order2, order3);
			if (StringUtils.isNotBlank(pagination.getColumnName())) {
				if (StringUtils.equals(pagination.getDirection(), "asc")) {
					sort = Sort.by(new Sort.Order(Direction.ASC, pagination.getColumnName()), order1, order2, order3);
				} else if (StringUtils.equals(pagination.getDirection(), "desc")) {
					sort = Sort.by(new Sort.Order(Direction.DESC, pagination.getColumnName()), order1, order2, order3);
				}
			}
			
			pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
			
			List<BatchTestcasesResult> batchTestcaseResultList = batchTestcaseResultRepository
					.getBatchTestcaseResultList(pageable, Long.parseLong(pagination.getId()));
			for (BatchTestcasesResult result : batchTestcaseResultList) {
				Map<String, String> dataMap = new HashMap<>();
				dataMap.put("col1", result.getElementsConfiguration().getApplicableAt());
				if (StringUtils.equalsIgnoreCase("line", result.getElementsConfiguration().getApplicableAt())
						&& result.getSeqNo() > 0) {
					dataMap.put("col1", result.getElementsConfiguration().getApplicableAt() + " #" + result.getSeqNo());
				}

				dataMap.put("col2", result.getElementsConfiguration().getElementLabel());
				dataMap.put("col3", StringUtils.defaultString(result.getExpectedValue(), ""));
				dataMap.put("col4", StringUtils.defaultString(result.getActualValue(), ""));
				dataMap.put("col5", result.getStatus());

				list.add(dataMap);

			}
		}

		return tableData;
	}

	@Override
	public String getGridModuleId() {
		return "batch-testcase-result";
	}

}
