package com.yorosis.livetester.service;

import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.transaction.Transactional;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yorosis.livetester.entities.Batch;
import com.yorosis.livetester.exception.YorosisException;
import com.yorosis.livetester.repo.BatchRepository;
import com.yorosis.livetester.repo.BatchTestcaseRepository;
import com.yorosis.livetester.vo.DayBasedReportVO;
import com.yorosis.livetester.vo.FormTypeBasedReportVO;
import com.yorosis.livetester.vo.TestReportGenerateVO;
import com.yorosis.livetester.vo.TestReportVO;

@Service
public class TestReportService {
	
	@Autowired
	private BatchRepository batchRepository;

	@Autowired
	private BatchTestcaseRepository batchTestcaseRepository;
	
	@Transactional
	public TestReportVO getTestReport(TestReportVO testReportVO) throws YorosisException {

		String message = "Test Report created successfully";
		List<Long> totalTestcaseList = new ArrayList<>(); 
		List<Long> totalPassList = new ArrayList<>();
		List<Long> totalFailList = new ArrayList<>();
		List<String> batchNameList = new ArrayList<>();

		Timestamp fromDate = Timestamp.valueOf(getFromLocalDateTime(testReportVO.getFromDate()));
		Timestamp toDate = Timestamp.valueOf(getToLocalDateTime(testReportVO.getToDate()));

		if (StringUtils.equals(testReportVO.getReportType(), "Batch Report")) {
			List<Batch> batchList = batchRepository.getBatchReport(fromDate, toDate);
			for (Batch batch : batchList) {
				batchNameList.add(batch.getBatchName() + "(" + dateToString(batch.getStartTime()) + ")");
				totalTestcaseList.add(batch.getTotalTestcases());
				totalPassList.add(batch.getPassPercentage());
				totalFailList.add(batch.getFailPercentage());
			}
		} else if (StringUtils.equals(testReportVO.getReportType(), "Form Type Based Report")) {
			List<FormTypeBasedReportVO> reportList = batchTestcaseRepository.getFormTypeBasedReport(fromDate, toDate);
			for (FormTypeBasedReportVO report : reportList) {
				batchNameList.add(report.getFormType());
				totalTestcaseList.add(report.getTotalTestCases());
				totalPassList.add(report.getTotalPass());
				totalFailList.add(report.getTotalFail());
			}
		} else if (StringUtils.equals(testReportVO.getReportType(), "Day Based Report")) {
			List<DayBasedReportVO> dayBasedReport = batchTestcaseRepository.getDayBasedReport(fromDate, toDate);
			for (DayBasedReportVO report : dayBasedReport) {
				batchNameList.add(dateToString(report.getDate()));
				totalTestcaseList.add(report.getTotalTestCases());
				totalPassList.add(report.getTotalPass());
				totalFailList.add(report.getTotalFail());
			}
		} else {
			throw new YorosisException("Invalid Report type");
		}

		List<TestReportGenerateVO> reports = new ArrayList<>();
		reports.add(0, TestReportGenerateVO.builder().name("Total Testcases").data(totalTestcaseList).color("#66ccff").build());
		reports.add(1, TestReportGenerateVO.builder().name("Total Pass").data(totalPassList).color("PaleGreen").build());
		reports.add(2, TestReportGenerateVO.builder().name("Total Fail").data(totalFailList).color("#ff3333").build());

		return TestReportVO.builder().batchNames(batchNameList).testReportVOList(reports).response(message).build();
	}
	
	private LocalDateTime getFromLocalDateTime(Timestamp date) {
		LocalDate localDate = date.toLocalDateTime().toLocalDate();
		return localDate.atStartOfDay();

	}

	private LocalDateTime getToLocalDateTime(Timestamp date) {
		LocalDate localDate = date.toLocalDateTime().toLocalDate();
		return LocalDateTime.of(localDate, LocalTime.MAX);

	}

	public String dateToString(Date date) {
		DateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy");
		return dateFormat.format(date);
	}


}
