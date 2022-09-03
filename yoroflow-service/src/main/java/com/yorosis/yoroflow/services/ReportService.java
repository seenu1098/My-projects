package com.yorosis.yoroflow.services;

import java.math.BigInteger;
import java.sql.Date;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.LineChartSeriesVO;
import com.yorosis.yoroflow.models.LineChartVO;
import com.yorosis.yoroflow.models.LineChartVO.LineChartVOBuilder;
import com.yorosis.yoroflow.models.ReportsDashboardVO;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskRepo;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ReportService {

	private static final String MM_DD_YYYY = "MM/dd/yyyy";

	@Autowired
	private ProcessInstanceTaskRepo processInstanceTaskRepo;

	@Transactional
	public LineChartVO getTotalTaskReports(ReportsDashboardVO vo) {
		log.debug("Loading the total tasks");
		SimpleDateFormat format = new SimpleDateFormat(MM_DD_YYYY);

		Set<Long> overallDateList = new TreeSet<>();
		Set<String> overallStatusList = new HashSet<>();
		Map<Long, Map<String, Double>> datewiseTaskMap = new HashMap<>();

		List<Object[]> tasksByStatusList = processInstanceTaskRepo.getTotalTasksByStatus(vo.getStartDate(), vo.getEndDate(),
				YorosisContext.get().getTenantId());
		for (Object[] object : tasksByStatusList) {
			Date date = (Date) object[0];
			String taskStatus = (String) object[1];

			if (StringUtils.equalsIgnoreCase(taskStatus, YorosisConstants.IN_PROCESS) || StringUtils.containsIgnoreCase(taskStatus, "PROCESS")) {
				taskStatus = YorosisConstants.IN_PROCESS;
			}
			overallDateList.add(date.getTime());
			overallStatusList.add(taskStatus);

			Map<String, Double> map = datewiseTaskMap.get(date.getTime());
			if (map == null) {
				map = new HashMap<>();
				datewiseTaskMap.put(date.getTime(), map);
			}
			map.put(taskStatus, ((BigInteger) object[2]).doubleValue());
		}

		LineChartVOBuilder lineChartBuilder = LineChartVO.builder();

		List<String> categoriesList = new ArrayList<>();
		List<LineChartSeriesVO> seriesList = new ArrayList<>();
		lineChartBuilder.categories(categoriesList);
		lineChartBuilder.series(seriesList);

		LineChartSeriesVO totalLineChartSeriesVo = LineChartSeriesVO.builder().data(new ArrayList<>()).name("Total Task").build();
		seriesList.add(totalLineChartSeriesVo);

		Map<String, LineChartSeriesVO> seriesVoMap = new HashMap<>();
		for (Long date : overallDateList) {
			categoriesList.add(format.format(new java.util.Date(date)));

			Map<String, Double> map = datewiseTaskMap.get(date);
			double totalTasks = 0;
			for (String status : overallStatusList) {
				LineChartSeriesVO lineChartSeriesVo = seriesVoMap.get(status);
				if (lineChartSeriesVo == null) {
					String displayName = getDisplayName(status);

					lineChartSeriesVo = LineChartSeriesVO.builder().data(new ArrayList<>()).name(displayName).build();
					seriesVoMap.put(status, lineChartSeriesVo);

					seriesList.add(lineChartSeriesVo);
				}

				Double taskCount = map.get(status);
				if (taskCount == null) {
					taskCount = 0d;
				}

				totalTasks += taskCount;
				lineChartSeriesVo.getData().add(taskCount);
			}

			totalLineChartSeriesVo.getData().add(totalTasks);
		}

		return lineChartBuilder.build();
	}

	private String getDisplayName(String status) {
		String displayName = status;
		if (StringUtils.equalsIgnoreCase(status, YorosisConstants.IN_PROCESS) || StringUtils.containsIgnoreCase(status, "PROCESS")) {
			displayName = "In Process Task";
		} else if (StringUtils.equalsIgnoreCase(status, YorosisConstants.COMPLETED)) {
			displayName = "Completed Task";
		}

		return displayName;
	}

	@Transactional
	public LineChartVO getTotalCompletedTaskByUser(ReportsDashboardVO vo) {
		List<Object[]> totalCompletedTaskByUserList = null;
		if (StringUtils.equals(vo.getOptionType(), "users") && vo.getUserId() != null) {
			log.debug("Loading the completeds tasks by user.  user-id if exists: {}", vo.getUserId());
			totalCompletedTaskByUserList = processInstanceTaskRepo.getTotalTasksByUser(vo.getStartDate(), vo.getEndDate(), YorosisContext.get().getTenantId(),
					vo.getUserId());
		} else {
			log.debug("Loading the completeds tasks by user");
			totalCompletedTaskByUserList = processInstanceTaskRepo.getTotalTasksByUser(vo.getStartDate(), vo.getEndDate(), YorosisContext.get().getTenantId());
		}

		return getLineChart(totalCompletedTaskByUserList);
	}

	@Transactional
	public LineChartVO getTotalAverageTimeOfCompletedTaskPerDay(ReportsDashboardVO vo) {
		log.debug("Loading the average time by tasks");
		List<Object[]> averageTimeByTasksList = processInstanceTaskRepo.getTotalCompletedAverageTimeByTasks(vo.getStartDate(), vo.getEndDate(),
				YorosisContext.get().getTenantId());

		return getLineChart(averageTimeByTasksList);
	}

	private LineChartVO getLineChart(List<Object[]> list) {
		SimpleDateFormat format = new SimpleDateFormat(MM_DD_YYYY);

		Set<Long> overallDateList = new TreeSet<>();
		Set<String> overallTaskList = new HashSet<>();
		Map<Long, Map<String, Double>> datewiseTaskMap = new HashMap<>();

		for (Object[] object : list) {
			Date date = (Date) object[0];
			String taskName = (String) object[1];

			overallDateList.add(date.getTime());
			overallTaskList.add(taskName);

			Map<String, Double> map = datewiseTaskMap.get(date.getTime());
			if (map == null) {
				map = new HashMap<>();
				datewiseTaskMap.put(date.getTime(), map);
			}

			double value = 0;
			if (object[2] instanceof BigInteger) {
				value = ((BigInteger) object[2]).doubleValue();
			} else {
				value = (Double) object[2];
			}

			map.put(taskName, value);
		}

		LineChartVOBuilder lineChartBuilder = LineChartVO.builder();

		List<String> categoriesList = new ArrayList<>();
		List<LineChartSeriesVO> seriesList = new ArrayList<>();
		lineChartBuilder.categories(categoriesList);
		lineChartBuilder.series(seriesList);

		Map<String, LineChartSeriesVO> seriesVoMap = new HashMap<>();
		for (Long date : overallDateList) {
			categoriesList.add(format.format(new java.util.Date(date)));

			Map<String, Double> map = datewiseTaskMap.get(date);
			for (String taskName : overallTaskList) {
				LineChartSeriesVO lineChartSeriesVo = seriesVoMap.get(taskName);

				if (lineChartSeriesVo == null) {
					lineChartSeriesVo = LineChartSeriesVO.builder().data(new ArrayList<>()).name(taskName).build();
					seriesVoMap.put(taskName, lineChartSeriesVo);

					seriesList.add(lineChartSeriesVo);
				}

				Double averageTime = map.get(taskName);
				if (averageTime == null) {
					averageTime = 0d;
				}
				lineChartSeriesVo.getData().add(Math.floor(averageTime));
			}
		}

		return lineChartBuilder.build();
	}

}
