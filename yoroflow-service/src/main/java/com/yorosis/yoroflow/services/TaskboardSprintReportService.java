package com.yorosis.yoroflow.services;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yorosis.yoroflow.entities.TaskboardSprintTask;
import com.yorosis.yoroflow.entities.TaskboardSprintWorkLog;
import com.yorosis.yoroflow.entities.TaskboardSprints;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.appwidgets.BarChartVO;
import com.yorosis.yoroflow.models.appwidgets.PlotPointAndColorVO;
import com.yorosis.yoroflow.repository.TaskboardSprintTasksRepository;
import com.yorosis.yoroflow.repository.TaskboardSprintWorkLogRepository;
import com.yorosis.yoroflow.repository.TaskboardSprintsRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class TaskboardSprintReportService {

	@Autowired
	private TaskboardSprintTasksRepository taskboardSprintTasksRepository;

	@Autowired
	private TaskboardSprintsRepository taskboardSprintsRepository;

	@Autowired
	private TaskboardSprintWorkLogRepository taskboardSprintWorkLogRepository;

	private static final String MM_DD_YYYY = "MM/dd/yyyy hh:mm";

	private UUID constructId(TaskboardSprintTask sprintTask) {
		return sprintTask.getSprintTaskId();
	}

	public BarChartVO getTaskboardSprintReports(UUID sprintId) {
		List<TaskboardSprintTask> sprintTaskList = taskboardSprintTasksRepository.getTaskboardSprintTasksListBySprintId(
				sprintId, YorosisContext.get().getTenantId(), YorosisConstants.YES);

		TaskboardSprints taskboardSprints = taskboardSprintsRepository.getTaskboardSprintsById(sprintId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		List<UUID> sprintTaskIdList = sprintTaskList.stream().map(this::constructId).collect(Collectors.toList());

		if (taskboardSprints != null && taskboardSprints.getSprintTotalEstimatedHours() != null
				&& taskboardSprints.getSprintStartDate() != null && taskboardSprints.getSprintEndDate() != null
				&& !sprintTaskIdList.isEmpty()) {
			Double sprintTotalEstimatedHours = taskboardSprints.getSprintTotalEstimatedHours();
			Timestamp sprintStartDate = taskboardSprints.getSprintStartDate();
			Timestamp sprintEndDate = taskboardSprints.getSprintEndDate();

			List<TaskboardSprintWorkLog> workLogList = taskboardSprintWorkLogRepository
					.getTaskboardSprintWorkLogByStartAndEndDate(sprintTaskIdList, sprintStartDate, sprintEndDate,
							YorosisContext.get().getTenantId(), YorosisConstants.YES);

			List<String> xAxisCategoriesList = new ArrayList<>();
			List<PlotPointAndColorVO> dataList = new ArrayList<>();
			SimpleDateFormat format = new SimpleDateFormat(MM_DD_YYYY);

			for (TaskboardSprintWorkLog sprintWorkLog : workLogList) {
				if (sprintWorkLog.getTimespent() != null && sprintWorkLog.getWorkDate() != null) {
					Double total = sprintTotalEstimatedHours - Double.valueOf(sprintWorkLog.getTimespent());
					if (total >= 0) {
						dataList.add(PlotPointAndColorVO.builder().y(total.longValue()).build());
						xAxisCategoriesList
								.add(format.format(new java.util.Date(sprintWorkLog.getWorkDate().getTime())));
						sprintTotalEstimatedHours = total;
					}
				}
			}
			return BarChartVO.builder().data(dataList).xAxisCategories(xAxisCategoriesList).build();
		}
		return BarChartVO.builder().build();
	}

}
