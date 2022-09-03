package com.yorosis.yoroflow.services;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.Dashboard;
import com.yorosis.yoroflow.entities.DashboardWidgets;
import com.yorosis.yoroflow.entities.ProcessInstance;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.entities.TaskboardColumns;
import com.yorosis.yoroflow.entities.TaskboardTask;
import com.yorosis.yoroflow.entities.Workspace;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.AllTaskVO;
import com.yorosis.yoroflow.models.FilterDateVO;
import com.yorosis.yoroflow.models.FilterValueVO;
import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.TableData;
import com.yorosis.yoroflow.models.TaskNameListVO;
import com.yorosis.yoroflow.models.UsersVO;
import com.yorosis.yoroflow.models.appwidgets.BarChartVO;
import com.yorosis.yoroflow.models.appwidgets.DashboardChartVO;
import com.yorosis.yoroflow.models.appwidgets.DashboardSwapVo;
import com.yorosis.yoroflow.models.appwidgets.DashboardVO;
import com.yorosis.yoroflow.models.appwidgets.DashboardWidgetVO;
import com.yorosis.yoroflow.models.appwidgets.PieChartVO;
import com.yorosis.yoroflow.models.appwidgets.PlotPointAndColorVO;
import com.yorosis.yoroflow.models.appwidgets.PortfolioTableDataVO;
import com.yorosis.yoroflow.models.appwidgets.PortfolioVO;
import com.yorosis.yoroflow.models.landingpage.BoardNameVo;
import com.yorosis.yoroflow.models.landingpage.LandingPageTaskBoardVO;
import com.yorosis.yoroflow.models.landingpage.StatusVo;
import com.yorosis.yoroflow.models.landingpage.TaskboardTaskVo;
import com.yorosis.yoroflow.models.landingpage.WorkflowVO;
import com.yorosis.yoroflow.repository.DashboardRepository;
import com.yorosis.yoroflow.repository.DashboardWidgetRepository;
import com.yorosis.yoroflow.repository.ProcessInstanceRepo;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskRepo;
import com.yorosis.yoroflow.repository.TaskboardRepository;
import com.yorosis.yoroflow.repository.TaskboardTaskRepository;
import com.yorosis.yoroflow.repository.WorkspaceRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class AppWidgetService {

	@Autowired
	private TaskboardRepository taskboardRepository;

	@Autowired
	private TaskboardTaskRepository taskboardTaskRepository;

	@Autowired
	private UserService userService;

	@Autowired
	private LandingPageService landingPageService;

	@Autowired
	private TaskboardService taskboardService;

	@Autowired
	private DashboardRepository dashboardRepository;

	@Autowired
	private DashboardWidgetRepository dashboardWidgetRepository;

	@Autowired
	private ProcessInstanceTaskRepo processInstanceTaskRepo;

	@Autowired
	private TaskListService taskListService;

	@Autowired
	private ProcessInstanceRepo processInstanceRepo;

	@Autowired
	private ProcessInstanceService processInstanceService;

	@Autowired
	private WorkspaceRepository workspaceRepository;

	private static final String BOARDNAME = "board_name";
	private static final String ASSIGNTO = "assignedTo";
	private static final String UNASSIGNED = "unAssigned";
	private static final String STATUS = "status";

	public List<PieChartVO> getWorkloadByStatus(DashboardChartVO dashboardChartVO) {
		List<Object[]> workloadByStatus = null;
		UsersVO userVO = userService.getLoggedInUserDetails();
		FilterDateVO filterDateVO = getStartAndEndDate(dashboardChartVO);
		if (dashboardChartVO.getTaskboardIdList().isEmpty() && dashboardChartVO.getWorkspaceIdList().isEmpty()) {

			workloadByStatus = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardRepository.getWorkloadByStatusWithoutFilter(userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardRepository.getWorkloadByStatusWithDateFilter(userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));

		} else if (dashboardChartVO.getTaskboardIdList().isEmpty()
				&& !dashboardChartVO.getWorkspaceIdList().isEmpty()) {

			workloadByStatus = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardRepository.getWorkloadByStatusByWorkspaceIdList(dashboardChartVO.getWorkspaceIdList(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardRepository.getWorkloadByStatusByWorkspaceIdListWithDateFilter(
							dashboardChartVO.getWorkspaceIdList(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));

		} else if (!dashboardChartVO.getTaskboardIdList().isEmpty()
				&& dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			workloadByStatus = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardRepository.getWorkloadByStatusByWorkspaceIdWithTaskboardIdList(userVO.getUserId(),
							dashboardChartVO.getTaskboardIdList(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES)
					: taskboardRepository.getWorkloadByStatusByWorkspaceIdWithTaskboardIdListAndDateFilter(
							userVO.getUserId(), dashboardChartVO.getTaskboardIdList(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else {
			workloadByStatus = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardRepository.getWorkloadByStatusByWorkspaceIdListandTaskboardIdList(
							dashboardChartVO.getTaskboardIdList(), dashboardChartVO.getWorkspaceIdList(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardRepository.getWorkloadByStatusByWorkspaceIdListandTaskboardIdListWithDateFilter(
							dashboardChartVO.getTaskboardIdList(), dashboardChartVO.getWorkspaceIdList(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		}
		List<PieChartVO> pieChartVO = new ArrayList<>();

		if (workloadByStatus != null && !workloadByStatus.isEmpty()) {
			for (Object[] object : workloadByStatus) {

				if (object[0] != null && object[1] != null && object[2] != null) {
					String name = (String) object[0];
					Double y = Double.valueOf(object[1].toString());
					pieChartVO.add(PieChartVO.builder().name(name).y(y).color(object[2].toString()).build());
				} else {
					pieChartVO.add(PieChartVO.builder().build());
				}
			}
		}
		return pieChartVO;
	}

	public BarChartVO getWorkloadByStatusForHorBarChart(DashboardChartVO dashboardChartVO) {
		List<Object[]> workloadByStatus = null;
		UsersVO userVO = userService.getLoggedInUserDetails();
		FilterDateVO filterDateVO = getStartAndEndDate(dashboardChartVO);
		if (dashboardChartVO.getTaskboardIdList().isEmpty() && dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			workloadByStatus = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardRepository.getWorkloadByStatusWithoutFilter(userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardRepository.getWorkloadByStatusWithDateFilter(userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else if (dashboardChartVO.getTaskboardIdList().isEmpty()
				&& !dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			workloadByStatus = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardRepository.getWorkloadByStatusByWorkspaceIdList(dashboardChartVO.getWorkspaceIdList(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardRepository.getWorkloadByStatusByWorkspaceIdListWithDateFilter(
							dashboardChartVO.getWorkspaceIdList(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else if (!dashboardChartVO.getTaskboardIdList().isEmpty()
				&& dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			workloadByStatus = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardRepository.getWorkloadByStatusByWorkspaceIdWithTaskboardIdList(userVO.getUserId(),
							dashboardChartVO.getTaskboardIdList(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES)
					: taskboardRepository.getWorkloadByStatusByWorkspaceIdWithTaskboardIdListAndDateFilter(
							userVO.getUserId(), dashboardChartVO.getTaskboardIdList(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else {
			workloadByStatus = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardRepository.getWorkloadByStatusByWorkspaceIdListandTaskboardIdList(
							dashboardChartVO.getTaskboardIdList(), dashboardChartVO.getWorkspaceIdList(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardRepository.getWorkloadByStatusByWorkspaceIdListandTaskboardIdListWithDateFilter(
							dashboardChartVO.getTaskboardIdList(), dashboardChartVO.getWorkspaceIdList(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		}
		List<String> xAxisCategoriesList = new ArrayList<>();
		List<PlotPointAndColorVO> dataList = new ArrayList<>();

		if (workloadByStatus != null && !workloadByStatus.isEmpty()) {
			for (Object[] object : workloadByStatus) {
				if (object[0] != null && object[1] != null && object[2] != null) {
					String name = (String) object[0];
					Long data = Long.valueOf(object[1].toString());
					dataList.add(PlotPointAndColorVO.builder().y(data).color(object[2].toString()).build());
					xAxisCategoriesList.add(name);
				} else {
					dataList.add(PlotPointAndColorVO.builder().build());
				}
			}
		}
		return BarChartVO.builder().xAxisCategories(xAxisCategoriesList).name("Total Task").data(dataList).build();
	}

	public List<PieChartVO> getTaskByAssignee(DashboardChartVO dashboardChartVO) {
		List<Object[]> taskByAssigneeList = null;
		log.info("context:{}", YorosisContext.get().getTenantId());
		UsersVO userVO = userService.getLoggedInUserDetails();
		FilterDateVO filterDateVO = getStartAndEndDate(dashboardChartVO);
		if (dashboardChartVO.getTaskboardIdList().isEmpty() && dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			taskByAssigneeList = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardRepository.getTaskByAssigneeWithoutFilter(userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardRepository.getTaskByAssigneeByDateWithoutFilter(userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else if (dashboardChartVO.getTaskboardIdList().isEmpty()
				&& !dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			taskByAssigneeList = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardRepository.getTaskByAssigneeByWorkspaceIdList(dashboardChartVO.getWorkspaceIdList(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardRepository.getTaskByAssigneeByWorkspaceIdListWithDateFilter(
							dashboardChartVO.getWorkspaceIdList(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else if (!dashboardChartVO.getTaskboardIdList().isEmpty()
				&& dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			taskByAssigneeList = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardRepository.getTaskByAssigneeByWorkspaceIdWithTaskboardIdList(userVO.getUserId(),
							dashboardChartVO.getTaskboardIdList(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES)
					: taskboardRepository.getTaskByAssigneeByWorkspaceIdWithTaskboardIdListWithDateFilter(
							userVO.getUserId(), dashboardChartVO.getTaskboardIdList(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else {
			taskByAssigneeList = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardRepository.getTaskByAssigneeByWorkspaceIdListandTaskboardIdList(
							dashboardChartVO.getTaskboardIdList(), dashboardChartVO.getWorkspaceIdList(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardRepository.getTaskByAssigneeByWorkspaceIdListandTaskboardIdListWithDateFilter(
							dashboardChartVO.getTaskboardIdList(), dashboardChartVO.getWorkspaceIdList(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		}
		List<PieChartVO> pieChartVO = new ArrayList<>();

		for (Object[] object : taskByAssigneeList) {
			if (object[0] != null && object[1] != null && object[2] != null && object[3] != null) {
				String name = object[0].toString() + " " + object[1].toString();
				Double y = Double.valueOf(object[2].toString());
				pieChartVO.add(PieChartVO.builder().name(name).y(y).color(object[3].toString()).build());
			} else {
				pieChartVO.add(PieChartVO.builder().build());
			}
		}
		return pieChartVO;
	}

	public BarChartVO getTaskByAssigneeForBarChart(DashboardChartVO dashboardChartVO) {
		List<Object[]> taskByAssigneeList = null;
		log.info("context:{}", YorosisContext.get().getTenantId());
		UsersVO userVO = userService.getLoggedInUserDetails();
		FilterDateVO filterDateVO = getStartAndEndDate(dashboardChartVO);
		if (dashboardChartVO.getTaskboardIdList().isEmpty() && dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			taskByAssigneeList = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardRepository.getTaskByAssigneeWithoutFilter(userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardRepository.getTaskByAssigneeByDateWithoutFilter(userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else if (dashboardChartVO.getTaskboardIdList().isEmpty()
				&& !dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			taskByAssigneeList = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardRepository.getTaskByAssigneeByWorkspaceIdList(dashboardChartVO.getWorkspaceIdList(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardRepository.getTaskByAssigneeByWorkspaceIdListWithDateFilter(
							dashboardChartVO.getWorkspaceIdList(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else if (!dashboardChartVO.getTaskboardIdList().isEmpty()
				&& dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			taskByAssigneeList = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardRepository.getTaskByAssigneeByWorkspaceIdWithTaskboardIdList(userVO.getUserId(),
							dashboardChartVO.getTaskboardIdList(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES)
					: taskboardRepository.getTaskByAssigneeByWorkspaceIdWithTaskboardIdListWithDateFilter(
							userVO.getUserId(), dashboardChartVO.getTaskboardIdList(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else {
			taskByAssigneeList = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardRepository.getTaskByAssigneeByWorkspaceIdListandTaskboardIdList(
							dashboardChartVO.getTaskboardIdList(), dashboardChartVO.getWorkspaceIdList(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardRepository.getTaskByAssigneeByWorkspaceIdListandTaskboardIdListWithDateFilter(
							dashboardChartVO.getTaskboardIdList(), dashboardChartVO.getWorkspaceIdList(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		}
		List<String> xAxisCategoriesList = new ArrayList<>();
		List<PlotPointAndColorVO> dataList = new ArrayList<>();
		for (Object[] object : taskByAssigneeList) {
			String name = null;
			Long data = 0L;
			String color = null;
			if (object[0] != null && object[1] != null) {
				name = (String) object[0] + " " + (String) object[1];
			}
			if (object[2] != null) {
				data = Long.valueOf(object[2].toString());
			}
			if (object[3] != null) {
				color = object[3].toString();
			}

			dataList.add(PlotPointAndColorVO.builder().y(data).color(color).build());
			xAxisCategoriesList.add(name);
		}
		return BarChartVO.builder().xAxisCategories(xAxisCategoriesList).name("Total Task").data(dataList).build();
	}

	public List<PieChartVO> getTasksByPriorityForPieChart(DashboardChartVO dashboardChartVO) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<PieChartVO> pieChartVO = new ArrayList<>();
		List<Object[]> taskByPriorityList = null;
		FilterDateVO filterDateVO = getStartAndEndDate(dashboardChartVO);
		if (dashboardChartVO.getTaskboardIdList().isEmpty() && dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			taskByPriorityList = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardTaskRepository.getTaskByPriority(userVO.getUserId(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES)
					: taskboardTaskRepository.getTaskByPriorityWithDateFilter(userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else if (dashboardChartVO.getTaskboardIdList().isEmpty()
				&& !dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			taskByPriorityList = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardTaskRepository.getTaskByPriorityWithWorkspaceIdList(
							dashboardChartVO.getWorkspaceIdList(), userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardTaskRepository.getTaskByPriorityWithWorkspaceIdListWithDateFilter(
							dashboardChartVO.getWorkspaceIdList(), userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else if (!dashboardChartVO.getTaskboardIdList().isEmpty()
				&& dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			taskByPriorityList = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardTaskRepository.getTaskByPriorityWithTaskboardIdList(
							dashboardChartVO.getTaskboardIdList(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES)
					: taskboardTaskRepository.getTaskByPriorityWithTaskboardIdListWithDateFilter(
							dashboardChartVO.getTaskboardIdList(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else if (!dashboardChartVO.getTaskboardIdList().isEmpty()
				&& !dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			taskByPriorityList = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardTaskRepository.getTaskByPriorityWithTaskboardIdListAndWorkspaceIdList(
							dashboardChartVO.getTaskboardIdList(), dashboardChartVO.getWorkspaceIdList(),
							userVO.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardTaskRepository.getTaskByPriorityWithTaskboardIdListAndWorkspaceIdListWithDateFilter(
							dashboardChartVO.getTaskboardIdList(), dashboardChartVO.getWorkspaceIdList(),
							userVO.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		}
		for (Object[] object : taskByPriorityList) {
			String name = null;
			Double y = null;
			String color = null;
			if (object[0] != null) {
				name = object[0].toString();
				color = getColor(name);
			}
			if (object[1] != null) {
				y = Double.valueOf(object[1].toString());
			}
			pieChartVO.add(PieChartVO.builder().name(name).y(y).color(color).build());
		}
		return pieChartVO;
	}

	public BarChartVO getTasksByPriorityForBarChart(DashboardChartVO dashboardChartVO) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<Object[]> taskByPriorityList = null;
		FilterDateVO filterDateVO = getStartAndEndDate(dashboardChartVO);
		if (dashboardChartVO.getTaskboardIdList().isEmpty() && dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			taskByPriorityList = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardTaskRepository.getTaskByPriority(userVO.getUserId(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES)
					: taskboardTaskRepository.getTaskByPriorityWithDateFilter(userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else if (dashboardChartVO.getTaskboardIdList().isEmpty()
				&& !dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			taskByPriorityList = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardTaskRepository.getTaskByPriorityWithWorkspaceIdList(
							dashboardChartVO.getWorkspaceIdList(), userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardTaskRepository.getTaskByPriorityWithWorkspaceIdListWithDateFilter(
							dashboardChartVO.getWorkspaceIdList(), userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else if (!dashboardChartVO.getTaskboardIdList().isEmpty()
				&& dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			taskByPriorityList = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardTaskRepository.getTaskByPriorityWithTaskboardIdList(
							dashboardChartVO.getTaskboardIdList(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES)
					: taskboardTaskRepository.getTaskByPriorityWithTaskboardIdListWithDateFilter(
							dashboardChartVO.getTaskboardIdList(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else if (!dashboardChartVO.getTaskboardIdList().isEmpty()
				&& !dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			taskByPriorityList = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardTaskRepository.getTaskByPriorityWithTaskboardIdListAndWorkspaceIdList(
							dashboardChartVO.getTaskboardIdList(), dashboardChartVO.getWorkspaceIdList(),
							userVO.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardTaskRepository.getTaskByPriorityWithTaskboardIdListAndWorkspaceIdListWithDateFilter(
							dashboardChartVO.getTaskboardIdList(), dashboardChartVO.getWorkspaceIdList(),
							userVO.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		}
		List<String> xAxisCategoriesList = new ArrayList<>();
		List<PlotPointAndColorVO> dataList = new ArrayList<>();
		for (Object[] object : taskByPriorityList) {
			String name = null;
			Long data = 0L;
			String color = null;
			if (object[0] != null) {
				name = object[0].toString();
				color = getColor(name);
			}
			if (object[1] != null) {
				data = Long.valueOf(object[1].toString());
			}

			dataList.add(PlotPointAndColorVO.builder().y(data).color(color).build());
			xAxisCategoriesList.add(name);
		}
		return BarChartVO.builder().xAxisCategories(xAxisCategoriesList).name("Total Task").data(dataList).build();
	}

	private String getColor(String name) {
		String color = null;
		if (StringUtils.equalsIgnoreCase(name, "Urgent")) {
			color = "red";
		} else if (StringUtils.equalsIgnoreCase(name, "High")) {
			color = "orange";
		} else if (StringUtils.equalsIgnoreCase(name, "Medium")) {
			color = "yellow";
		} else if (StringUtils.equalsIgnoreCase(name, "Low")) {
			color = "#37bdff";
		}
		return color;

	}

	public TaskboardTaskVo getPriorityTaskCount(DashboardChartVO dashboardChartVO) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		String task = "0";
		Long priorityTask = 0L;
		FilterDateVO filterDateVO = getStartAndEndDate(dashboardChartVO);
		if (dashboardChartVO.getTaskboardIdList().isEmpty() && dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			priorityTask = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardTaskRepository.getPriorityTask(dashboardChartVO.getPriority(), userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardTaskRepository.getPriorityTaskWithDateFilter(dashboardChartVO.getPriority(),
							userVO.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else if (!dashboardChartVO.getTaskboardIdList().isEmpty()
				&& dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			priorityTask = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardTaskRepository.getPriorityTaskByTaskboardIdList(dashboardChartVO.getPriority(),
							dashboardChartVO.getTaskboardIdList(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES)
					: taskboardTaskRepository.getPriorityTaskByTaskboardIdListWithDateFilter(
							dashboardChartVO.getPriority(), dashboardChartVO.getTaskboardIdList(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else if (dashboardChartVO.getTaskboardIdList().isEmpty()
				&& !dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			priorityTask = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardTaskRepository.getPriorityTaskByWorkspaceIdList(dashboardChartVO.getPriority(),
							dashboardChartVO.getWorkspaceIdList(), userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardTaskRepository.getPriorityTaskByWorkspaceIdListWithDateFilter(
							dashboardChartVO.getPriority(), dashboardChartVO.getWorkspaceIdList(), userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else if (!dashboardChartVO.getTaskboardIdList().isEmpty()
				&& !dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			priorityTask = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardTaskRepository.getPriorityTaskByTaskboardIdListAndWorkspaceIdList(
							dashboardChartVO.getPriority(), dashboardChartVO.getTaskboardIdList(),
							dashboardChartVO.getWorkspaceIdList(), userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardTaskRepository.getPriorityTaskByTaskboardIdListAndWorkspaceIdListWithDateFilter(
							dashboardChartVO.getPriority(), dashboardChartVO.getTaskboardIdList(),
							dashboardChartVO.getWorkspaceIdList(), userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		}
		if (priorityTask != null) {
			task = priorityTask.toString();
		}
		return TaskboardTaskVo.builder().totalRecords(task).build();
	}

	public TaskboardTaskVo getNoPriorityTaskCount(DashboardChartVO dashboardChartVO) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		Long priorityTask = 0L;
		String task = "0";
		FilterDateVO filterDateVO = getStartAndEndDate(dashboardChartVO);
		if (dashboardChartVO.getTaskboardIdList().isEmpty() && dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			priorityTask = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardTaskRepository.getNoPriorityTask(userVO.getUserId(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES)
					: taskboardTaskRepository.getNoPriorityTaskWithDateFilter(userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else if (!dashboardChartVO.getTaskboardIdList().isEmpty()
				&& dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			priorityTask = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardTaskRepository.getNoPriorityTaskWithTaskboardIdList(
							dashboardChartVO.getTaskboardIdList(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES)
					: taskboardTaskRepository.getNoPriorityTaskWithTaskboardIdListWithDateFilter(
							dashboardChartVO.getTaskboardIdList(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else if (dashboardChartVO.getTaskboardIdList().isEmpty()
				&& !dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			priorityTask = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardTaskRepository.getNoPriorityTaskWithWorkspaceIdList(
							dashboardChartVO.getWorkspaceIdList(), userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardTaskRepository.getNoPriorityTaskWithWorkspaceIdListWithDateFilter(
							dashboardChartVO.getWorkspaceIdList(), userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		} else if (!dashboardChartVO.getTaskboardIdList().isEmpty()
				&& !dashboardChartVO.getWorkspaceIdList().isEmpty()) {
			priorityTask = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
					? taskboardTaskRepository.getNoPriorityTaskWithTaskboardIdListAndWorkspaceIdList(
							dashboardChartVO.getTaskboardIdList(), dashboardChartVO.getWorkspaceIdList(),
							userVO.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES)
					: taskboardTaskRepository.getNoPriorityTaskWithTaskboardIdListAndWorkspaceIdListWithDateFilter(
							dashboardChartVO.getTaskboardIdList(), dashboardChartVO.getWorkspaceIdList(),
							userVO.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		}
		if (priorityTask != null) {
			task = priorityTask.toString();
		}
		return TaskboardTaskVo.builder().totalRecords(task).build();
	}

	@Transactional
	public TaskboardTaskVo getAllDeletedTaskboardTaskByWorkspaceId(PaginationVO paginationVO) {
		List<TaskboardTask> taskboardTaskList = null;
		List<LandingPageTaskBoardVO> landingPageTaskBoardVO = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		Pageable pageable = landingPageService.getPageable(paginationVO, true);
		List<UUID> userList = new ArrayList<>();
		List<String> boardName = new ArrayList<>();
		List<String> status = new ArrayList<>();
		Boolean unassigned = false;
		if (paginationVO.getFilterValue() != null && paginationVO.getFilterValue().length != 0) {
			for (FilterValueVO fValue : paginationVO.getFilterValue()) {
				if (StringUtils.equals(fValue.getFilterIdColumn(), BOARDNAME)) {
					boardName.add(fValue.getFilterIdColumnValue());
				}

				if (StringUtils.equals(fValue.getFilterIdColumn(), STATUS)) {
					status.add(fValue.getFilterIdColumnValue());
				}

				if (StringUtils.equals(fValue.getFilterIdColumn(), ASSIGNTO)
						&& !StringUtils.equals(fValue.getFilterIdColumnValue(), UNASSIGNED)) {
					userList.add(UUID.fromString(fValue.getFilterIdColumnValue()));
				}

				if (StringUtils.equals(fValue.getFilterIdColumn(), ASSIGNTO)
						&& StringUtils.equals(fValue.getFilterIdColumnValue(), UNASSIGNED)) {
					unassigned = true;
				}
			}
		}

		if (boardName.isEmpty() && userList.isEmpty() && status.isEmpty() && BooleanUtils.isFalse(unassigned)) {
			if (paginationVO.getTaskboardIdList() == null || paginationVO.getTaskboardIdList().isEmpty()) {
				taskboardTaskList = taskboardTaskRepository.getAllDeletedTaskForAllWorkspace(userVO.getUserId(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable);
			} else if (paginationVO.getTaskboardIdList() != null || !paginationVO.getTaskboardIdList().isEmpty()) {
				taskboardTaskList = taskboardTaskRepository.getAllDeletedTaskByTaskboardIdList(userVO.getUserId(),
						paginationVO.getTaskboardIdList(), YorosisContext.get().getTenantId(), YorosisConstants.YES,
						pageable);
			}
		} else {

			taskboardTaskList = taskboardTaskRepository.getAllDeletedTaskForAllWorkspaceWithoutPagination(
					userVO.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (!boardName.isEmpty() && taskboardTaskList != null && !taskboardTaskList.isEmpty()) {
				taskboardTaskList = taskboardTaskList.stream()
						.filter(f -> (boardName.contains(f.getTaskboard().getName()))).collect(Collectors.toList());
			}

			if (!status.isEmpty() && taskboardTaskList != null) {
				taskboardTaskList = taskboardTaskList.stream().filter(f -> (status.contains(f.getStatus())))
						.collect(Collectors.toList());
			}

			if (!userList.isEmpty() && taskboardTaskList != null) {
				if (BooleanUtils.isTrue(unassigned)) {
					taskboardTaskList = taskboardTaskList.stream().filter(
							f -> f.getTaskboardTaskAssignedUsers().isEmpty() || (!f.getTaskboardTaskAssignedUsers()
									.stream().filter(t -> userList.contains(t.getUserId())).collect(Collectors.toList())
									.isEmpty()))
							.collect(Collectors.toList());
				} else {
					taskboardTaskList = taskboardTaskList.stream()
							.filter(f -> !f.getTaskboardTaskAssignedUsers().stream()
									.filter(t -> userList.contains(t.getUserId())).collect(Collectors.toList())
									.isEmpty())
							.collect(Collectors.toList());
				}
			} else if (BooleanUtils.isTrue(unassigned) && taskboardTaskList != null && !taskboardTaskList.isEmpty()) {
				taskboardTaskList = taskboardTaskList.stream().filter(f -> f.getTaskboardTaskAssignedUsers().isEmpty())
						.collect(Collectors.toList());
			}
		}

		FilterDateVO filterDateVO = getStartAndEndDate(paginationVO);

		if (taskboardTaskList != null && filterDateVO.getStartDate() != null && filterDateVO.getEndDate() != null) {
			taskboardTaskList = taskboardTaskList.stream()
					.filter(f -> (f.getCreatedOn().equals(Timestamp.valueOf(filterDateVO.getStartDate()))
							|| f.getCreatedOn().after(Timestamp.valueOf(filterDateVO.getStartDate())))
							&& (f.getCreatedOn().equals(Timestamp.valueOf(filterDateVO.getEndDate()))
									|| f.getCreatedOn().before(Timestamp.valueOf(filterDateVO.getEndDate()))))
					.collect(Collectors.toList());
		}

		TaskboardTaskVo taskboardTaskVO = landingPageService.getTaskboardTaskTaskByFilter(paginationVO,
				taskboardTaskList, landingPageTaskBoardVO);
		taskboardTaskVO.setStatusList(getStatusListForAllDeletedTaskboardTask(pageable, userVO));
		return taskboardTaskVO;
	}

	@Transactional
	public TaskboardTaskVo getAllDoneTaskboardTaskByWorkspaceId(PaginationVO paginationVO) {
		List<TaskboardTask> taskboardTaskList = null;
		List<LandingPageTaskBoardVO> landingPageTaskBoardVO = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		Pageable pageable = landingPageService.getPageable(paginationVO, true);

		List<UUID> userList = new ArrayList<>();
		List<String> boardName = new ArrayList<>();
		List<String> status = new ArrayList<>();
		Boolean unassigned = false;
		if (paginationVO.getFilterValue() != null && paginationVO.getFilterValue().length != 0) {
			for (FilterValueVO fValue : paginationVO.getFilterValue()) {
				if (StringUtils.equals(fValue.getFilterIdColumn(), BOARDNAME)) {
					boardName.add(fValue.getFilterIdColumnValue());
				}

				if (StringUtils.equals(fValue.getFilterIdColumn(), STATUS)) {
					status.add(fValue.getFilterIdColumnValue());
				}

				if (StringUtils.equals(fValue.getFilterIdColumn(), ASSIGNTO)
						&& StringUtils.equals(fValue.getFilterIdColumnValue(), UNASSIGNED)) {
					unassigned = true;
				}
				if (StringUtils.equals(fValue.getFilterIdColumn(), ASSIGNTO)
						&& !StringUtils.equals(fValue.getFilterIdColumnValue(), UNASSIGNED)) {
					userList.add(UUID.fromString(fValue.getFilterIdColumnValue()));
				}
			}
		}
		if (boardName.isEmpty() && userList.isEmpty() && status.isEmpty() && BooleanUtils.isFalse(unassigned)) {
			if (paginationVO.getTaskboardIdList() == null || paginationVO.getTaskboardIdList().isEmpty()) {
				taskboardTaskList = taskboardTaskRepository.getAllDoneTaskForAllWorkspace(userVO.getUserId(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable);
			} else if (paginationVO.getTaskboardIdList() != null || !paginationVO.getTaskboardIdList().isEmpty()) {
				taskboardTaskList = taskboardTaskRepository.getAllDoneTaskByTaskboardIdList(userVO.getUserId(),
						paginationVO.getTaskboardIdList(), YorosisContext.get().getTenantId(), YorosisConstants.YES,
						pageable);
			}
		} else {

			taskboardTaskList = taskboardTaskRepository.getAllDoneTaskForAllWorkspaceWithoutPagination(
					userVO.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);

			if (!boardName.isEmpty() && taskboardTaskList != null) {
				taskboardTaskList = taskboardTaskList.stream()
						.filter(f -> (boardName.contains(f.getTaskboard().getName()))).collect(Collectors.toList());
			}

			if (!status.isEmpty() && taskboardTaskList != null) {
				taskboardTaskList = taskboardTaskList.stream().filter(f -> (status.contains(f.getStatus())))
						.collect(Collectors.toList());
			}

			if (!userList.isEmpty() && taskboardTaskList != null) {
				if (BooleanUtils.isTrue(unassigned)) {
					taskboardTaskList = taskboardTaskList.stream().filter(
							f -> f.getTaskboardTaskAssignedUsers().isEmpty() || (!f.getTaskboardTaskAssignedUsers()
									.stream().filter(t -> userList.contains(t.getUserId())).collect(Collectors.toList())
									.isEmpty()))
							.collect(Collectors.toList());
				} else {
					taskboardTaskList = taskboardTaskList.stream()
							.filter(f -> !f.getTaskboardTaskAssignedUsers().stream()
									.filter(t -> userList.contains(t.getUserId())).collect(Collectors.toList())
									.isEmpty())
							.collect(Collectors.toList());
				}
			} else if (BooleanUtils.isTrue(unassigned) && taskboardTaskList != null && !taskboardTaskList.isEmpty()) {
				taskboardTaskList = taskboardTaskList.stream().filter(f -> f.getTaskboardTaskAssignedUsers().isEmpty())
						.collect(Collectors.toList());
			}
		}

		FilterDateVO filterDateVO = getStartAndEndDate(paginationVO);

		if (taskboardTaskList != null && filterDateVO.getStartDate() != null && filterDateVO.getEndDate() != null) {
			taskboardTaskList = taskboardTaskList.stream()
					.filter(f -> (f.getCreatedOn().equals(Timestamp.valueOf(filterDateVO.getStartDate()))
							|| f.getCreatedOn().after(Timestamp.valueOf(filterDateVO.getStartDate())))
							&& (f.getCreatedOn().equals(Timestamp.valueOf(filterDateVO.getEndDate()))
									|| f.getCreatedOn().before(Timestamp.valueOf(filterDateVO.getEndDate()))))
					.collect(Collectors.toList());
		}

		TaskboardTaskVo taskboardTaskVO = landingPageService.getTaskboardTaskTaskByFilter(paginationVO,
				taskboardTaskList, landingPageTaskBoardVO);
		taskboardTaskVO.setStatusList(getStatusListForAllDoneTaskboardTask(pageable, userVO));
		return taskboardTaskVO;
	}

	@Transactional
	public TaskboardTaskVo getAllInProgressTaskboardTaskByWorkspaceId(PaginationVO paginationVO) {
		List<TaskboardTask> taskboardTaskList = null;
		List<LandingPageTaskBoardVO> landingPageTaskBoardVO = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		Pageable pageable = landingPageService.getPageable(paginationVO, true);

		List<String> status = new ArrayList<>();
		List<String> boardName = new ArrayList<>();
		List<UUID> userList = new ArrayList<>();
		Boolean unassigned = false;

		if (paginationVO.getFilterValue() != null && paginationVO.getFilterValue().length != 0) {
			for (FilterValueVO fValue : paginationVO.getFilterValue()) {
				if (StringUtils.equals(fValue.getFilterIdColumn(), BOARDNAME)) {
					boardName.add(fValue.getFilterIdColumnValue());
				}

				if (StringUtils.equals(fValue.getFilterIdColumn(), STATUS)) {
					status.add(fValue.getFilterIdColumnValue());
				}

				if (StringUtils.equals(fValue.getFilterIdColumn(), ASSIGNTO)
						&& StringUtils.equals(fValue.getFilterIdColumnValue(), UNASSIGNED)) {
					unassigned = true;
				}
				if (StringUtils.equals(fValue.getFilterIdColumn(), ASSIGNTO)
						&& !StringUtils.equals(fValue.getFilterIdColumnValue(), UNASSIGNED)) {
					userList.add(UUID.fromString(fValue.getFilterIdColumnValue()));
				}
			}
		}

		if (boardName.isEmpty() && userList.isEmpty() && status.isEmpty() && BooleanUtils.isFalse(unassigned)) {
			if (paginationVO.getTaskboardIdList() == null || paginationVO.getTaskboardIdList().isEmpty()) {
				taskboardTaskList = taskboardTaskRepository.getAllInProgressTaskForAllWorkspace(userVO.getUserId(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable);
			} else if (paginationVO.getTaskboardIdList() != null || !paginationVO.getTaskboardIdList().isEmpty()) {
				taskboardTaskList = taskboardTaskRepository.getAllInProgressTaskByTaskboardIdList(userVO.getUserId(),
						paginationVO.getTaskboardIdList(), YorosisContext.get().getTenantId(), YorosisConstants.YES,
						pageable);
			}
		} else {
			taskboardTaskList = taskboardTaskRepository.getAllInProgressTaskForAllWorkspaceWithoutPagination(
					userVO.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);

			if (!boardName.isEmpty() && taskboardTaskList != null && !taskboardTaskList.isEmpty()) {
				taskboardTaskList = taskboardTaskList.stream()
						.filter(f -> (boardName.contains(f.getTaskboard().getName()))).collect(Collectors.toList());
			}

			if (!status.isEmpty() && taskboardTaskList != null) {
				taskboardTaskList = taskboardTaskList.stream().filter(f -> (status.contains(f.getStatus())))
						.collect(Collectors.toList());
			}

			if (!userList.isEmpty() && taskboardTaskList != null) {
				if (BooleanUtils.isTrue(unassigned)) {
					taskboardTaskList = taskboardTaskList.stream().filter(
							f -> f.getTaskboardTaskAssignedUsers().isEmpty() || (!f.getTaskboardTaskAssignedUsers()
									.stream().filter(t -> userList.contains(t.getUserId())).collect(Collectors.toList())
									.isEmpty()))
							.collect(Collectors.toList());
				} else {
					taskboardTaskList = taskboardTaskList.stream()
							.filter(f -> !f.getTaskboardTaskAssignedUsers().stream()
									.filter(t -> userList.contains(t.getUserId())).collect(Collectors.toList())
									.isEmpty())
							.collect(Collectors.toList());
				}
			} else if (BooleanUtils.isTrue(unassigned) && taskboardTaskList != null && !taskboardTaskList.isEmpty()) {
				taskboardTaskList = taskboardTaskList.stream().filter(f -> f.getTaskboardTaskAssignedUsers().isEmpty())
						.collect(Collectors.toList());
			}
		}

		FilterDateVO filterDateVO = getStartAndEndDate(paginationVO);

		if (taskboardTaskList != null && filterDateVO.getStartDate() != null && filterDateVO.getEndDate() != null) {
			taskboardTaskList = taskboardTaskList.stream()
					.filter(f -> (f.getCreatedOn().equals(Timestamp.valueOf(filterDateVO.getStartDate()))
							|| f.getCreatedOn().after(Timestamp.valueOf(filterDateVO.getStartDate())))
							&& (f.getCreatedOn().equals(Timestamp.valueOf(filterDateVO.getEndDate()))
									|| f.getCreatedOn().before(Timestamp.valueOf(filterDateVO.getEndDate()))))
					.collect(Collectors.toList());
		}

		TaskboardTaskVo taskboardTaskVO = landingPageService.getTaskboardTaskTaskByFilter(paginationVO,
				taskboardTaskList, landingPageTaskBoardVO);
		taskboardTaskVO.setStatusList(getStatusListForAllInProgressTasks(pageable, userVO));
		return taskboardTaskVO;
	}

	@Transactional
	public TaskboardTaskVo getAllUnassignedTaskboardTaskByWorkspaceId(PaginationVO paginationVO) {
		List<TaskboardTask> taskboardTaskList = null;
		List<LandingPageTaskBoardVO> landingPageTaskBoardVO = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		Pageable pageable = landingPageService.getPageable(paginationVO, true);
		List<String> boardName = new ArrayList<>();
		List<String> status = new ArrayList<>();
		if (paginationVO.getFilterValue() != null && paginationVO.getFilterValue().length != 0) {
			for (FilterValueVO fValue : paginationVO.getFilterValue()) {
				if (StringUtils.equals(fValue.getFilterIdColumn(), BOARDNAME)) {
					boardName.add(fValue.getFilterIdColumnValue());
				}

				if (StringUtils.equals(fValue.getFilterIdColumn(), STATUS)) {
					status.add(fValue.getFilterIdColumnValue());
				}
			}
		}

		if (paginationVO.getTaskboardIdList() == null || paginationVO.getTaskboardIdList().isEmpty()) {
			taskboardTaskList = taskboardTaskRepository.getAllUnassignedTaskForAllWorkspace(userVO.getUserId(),
					YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable);
		} else if (paginationVO.getTaskboardIdList() != null || !paginationVO.getTaskboardIdList().isEmpty()) {
			taskboardTaskList = taskboardTaskRepository.getAllUnassignedTaskByTaskboardIdList(userVO.getUserId(),
					paginationVO.getTaskboardIdList(), YorosisContext.get().getTenantId(), YorosisConstants.YES,
					pageable);
		}

		if (!boardName.isEmpty() && taskboardTaskList != null) {
			taskboardTaskList = taskboardTaskList.stream().filter(f -> (boardName.contains(f.getTaskboard().getName())))
					.collect(Collectors.toList());
		}

		if (!status.isEmpty() && taskboardTaskList != null) {
			taskboardTaskList = taskboardTaskList.stream().filter(f -> (status.contains(f.getStatus())))
					.collect(Collectors.toList());
		}

		FilterDateVO filterDateVO = getStartAndEndDate(paginationVO);

		if (taskboardTaskList != null && filterDateVO.getStartDate() != null && filterDateVO.getEndDate() != null) {
			taskboardTaskList = taskboardTaskList.stream()
					.filter(f -> (f.getCreatedOn().equals(Timestamp.valueOf(filterDateVO.getStartDate()))
							|| f.getCreatedOn().after(Timestamp.valueOf(filterDateVO.getStartDate())))
							&& (f.getCreatedOn().equals(Timestamp.valueOf(filterDateVO.getEndDate()))
									|| f.getCreatedOn().before(Timestamp.valueOf(filterDateVO.getEndDate()))))
					.collect(Collectors.toList());
		}

		TaskboardTaskVo taskboardTaskVO = landingPageService.getTaskboardTaskTaskByFilter(paginationVO,
				taskboardTaskList, landingPageTaskBoardVO);
		taskboardTaskVO.setStatusList(getStatusListForAllUnassignedTasks(pageable, userVO));
		return taskboardTaskVO;
	}

	@Transactional
	public TaskboardTaskVo getAllAssignedTaskCountForAllWorkspace(PaginationVO paginationVO) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		Long allAssignedTaskCountForAllWorkspace = 0L;
		FilterDateVO filterDateVO = getStartAndEndDate(paginationVO);
		if (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null) {
			allAssignedTaskCountForAllWorkspace = taskboardTaskRepository.getAllAssignedTaskCountForAllWorkspace(
					userVO.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		} else {
			allAssignedTaskCountForAllWorkspace = taskboardTaskRepository
					.getAllAssignedTaskCountForAllWorkspaceWithDateFilter(userVO.getUserId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES,
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));
		}
		return TaskboardTaskVo.builder().totalRecords(allAssignedTaskCountForAllWorkspace.toString()).build();
	}

	@Transactional
	public TaskboardTaskVo getTaskList(PaginationVO paginationVO) {
		List<TaskboardTask> taskboardTaskList = null;
		List<LandingPageTaskBoardVO> landingPageTaskBoardVO = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		Pageable pageable = landingPageService.getPageable(paginationVO, true);
		List<String> status = new ArrayList<>();
		List<String> boardName = new ArrayList<>();
		List<UUID> userList = new ArrayList<>();
		Boolean unassigned = false;

		if (paginationVO.getFilterValue() != null && paginationVO.getFilterValue().length != 0) {
			for (FilterValueVO fValue : paginationVO.getFilterValue()) {
				if (StringUtils.equals(fValue.getFilterIdColumn(), BOARDNAME)) {
					boardName.add(fValue.getFilterIdColumnValue());
				}

				if (StringUtils.equals(fValue.getFilterIdColumn(), STATUS)) {
					status.add(fValue.getFilterIdColumnValue());
				}

				if (StringUtils.equals(fValue.getFilterIdColumn(), ASSIGNTO)
						&& StringUtils.equals(fValue.getFilterIdColumnValue(), UNASSIGNED)) {
					unassigned = true;
				}
				if (StringUtils.equals(fValue.getFilterIdColumn(), ASSIGNTO)
						&& !StringUtils.equals(fValue.getFilterIdColumnValue(), UNASSIGNED)) {
					userList.add(UUID.fromString(fValue.getFilterIdColumnValue()));
				}
			}
		}

		if (paginationVO.getTaskboardIdList() == null || paginationVO.getTaskboardIdList().isEmpty()) {
			if (!userList.isEmpty()) {
				taskboardTaskList = taskboardTaskRepository.getTaskListForAllWorkplaceWithUserIdList(userVO.getUserId(),
						userList, unassigned, YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable);
			} else if (userList.isEmpty() && BooleanUtils.isFalse(unassigned)) {
				taskboardTaskList = taskboardTaskRepository.getTaskListForAllWorkplace(userVO.getUserId(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable);
			} else if (userList.isEmpty() && BooleanUtils.isTrue(unassigned)) {
				taskboardTaskList = taskboardTaskRepository.getTaskListForAllWorkplaceWithUnassignedUser(
						userVO.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable);
			}
		} else {
			if (userList.isEmpty() && BooleanUtils.isFalse(unassigned)) {
				taskboardTaskList = taskboardTaskRepository.getTaskListbyTaskboardIdList(userVO.getUserId(),
						paginationVO.getTaskboardIdList(), YorosisContext.get().getTenantId(), YorosisConstants.YES,
						pageable);
			} else if (!userList.isEmpty() && BooleanUtils.isFalse(unassigned)) {
				taskboardTaskList = taskboardTaskRepository.getTaskListbyTaskboardIdListWithUserIdList(userList,
						paginationVO.getTaskboardIdList(), YorosisContext.get().getTenantId(), YorosisConstants.YES,
						pageable);
			} else if (!userList.isEmpty() && BooleanUtils.isTrue(unassigned)) {
				taskboardTaskList = taskboardTaskRepository.getTaskListbyTaskboardIdListWithUserIdListAndUnassignedUser(
						userList, paginationVO.getTaskboardIdList(), YorosisContext.get().getTenantId(),
						YorosisConstants.YES, pageable);
			} else if (userList.isEmpty() && BooleanUtils.isTrue(unassigned)) {
				taskboardTaskList = taskboardTaskRepository.getTaskListbyTaskboardIdListWithUserIdListAndUnassignedUser(
						paginationVO.getTaskboardIdList(), YorosisContext.get().getTenantId(), YorosisConstants.YES,
						pageable);
			}
		}

		if (!boardName.isEmpty() && taskboardTaskList != null && !taskboardTaskList.isEmpty()) {
			taskboardTaskList = taskboardTaskList.stream().filter(f -> (boardName.contains(f.getTaskboard().getName())))
					.collect(Collectors.toList());
		}

		if (!status.isEmpty() && taskboardTaskList != null) {
			taskboardTaskList = taskboardTaskList.stream().filter(f -> (status.contains(f.getStatus())))
					.collect(Collectors.toList());
		}

		FilterDateVO filterDateVO = getStartAndEndDate(paginationVO);
		if (taskboardTaskList != null && filterDateVO.getStartDate() != null && filterDateVO.getEndDate() != null) {
			taskboardTaskList = taskboardTaskList.stream()
					.filter(f -> (f.getCreatedOn().equals(Timestamp.valueOf(filterDateVO.getStartDate()))
							|| f.getCreatedOn().after(Timestamp.valueOf(filterDateVO.getStartDate())))
							&& (f.getCreatedOn().equals(Timestamp.valueOf(filterDateVO.getEndDate()))
									|| f.getCreatedOn().before(Timestamp.valueOf(filterDateVO.getEndDate()))))
					.collect(Collectors.toList());
		}

		TaskboardTaskVo taskboardTaskVO = landingPageService.getTaskboardTaskTaskByFilter(paginationVO,
				taskboardTaskList, landingPageTaskBoardVO);
		taskboardTaskVO.setStatusList(getStatusListForTaskList(pageable, userVO, userList));
		return taskboardTaskVO;
	}

	public List<StatusVo> getStatusListForTaskList(Pageable pageable, UsersVO userVO, List<UUID> userList) {

		List<TaskboardTask> taskboardTaskList = taskboardTaskRepository.getTaskListForAllWorkplace(userVO.getUserId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable);

		return getconstructStatusVo(taskboardTaskList);
	}

	public List<StatusVo> getStatusListForAllUnassignedTasks(Pageable pageable, UsersVO userVO) {

		List<TaskboardTask> taskboardTaskList = taskboardTaskRepository.getAllUnassignedTaskForAllWorkspace(
				userVO.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable);

		return getconstructStatusVo(taskboardTaskList);
	}

	public List<StatusVo> getStatusListForAllInProgressTasks(Pageable pageable, UsersVO userVO) {

		List<TaskboardTask> taskboardTaskList = taskboardTaskRepository.getAllInProgressTaskForAllWorkspace(
				userVO.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable);

		return getconstructStatusVo(taskboardTaskList);
	}

	public List<StatusVo> getStatusListForAllDeletedTaskboardTask(Pageable pageable, UsersVO userVO) {
		List<TaskboardTask> taskboardTaskList = taskboardTaskRepository.getAllDeletedTaskForAllWorkspace(
				userVO.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable);

		return getconstructStatusVo(taskboardTaskList);
	}

	public List<StatusVo> getStatusListForAllDoneTaskboardTask(Pageable pageable, UsersVO userVO) {
		List<TaskboardTask> taskboardTaskList = taskboardTaskRepository.getAllDoneTaskForAllWorkspace(
				userVO.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable);
		return getconstructStatusVo(taskboardTaskList);
	}

	private List<StatusVo> getconstructStatusVo(List<TaskboardTask> taskboardTaskList) {
		List<String> statusUUIDList = new ArrayList<>();
		List<StatusVo> statusList = new ArrayList<>();
		for (TaskboardTask taskboardTask : taskboardTaskList) {
			String statusColor = null;
			List<TaskboardColumns> taskboardColumn = taskboardTask.getTaskboard().getTaskboardColumns().stream()
					.filter(f -> StringUtils.equals(f.getColumnName(), taskboardTask.getStatus()))
					.collect(Collectors.toList());
			if (!statusUUIDList.contains(taskboardTask.getStatus()) && taskboardColumn != null
					&& !taskboardColumn.isEmpty()) {
				statusColor = taskboardColumn.get(0).getColumnColor();
				statusList.add(StatusVo.builder().status(taskboardTask.getStatus()).color(statusColor).build());
				statusUUIDList.add(taskboardTask.getStatus());
			}
		}
		Collections.sort(statusList, (p1, p2) -> p1.getStatus().compareToIgnoreCase(p2.getStatus()));
		return statusList;
	}

	@Transactional
	public PortfolioTableDataVO getPortfolioByWorkspaceId(PaginationVO paginationVO) {
		List<PortfolioVO> portfolioVOList = new ArrayList<>();
		Pageable pageable = landingPageService.getPageableWithoutSort(paginationVO, true);
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<Object[]> protfolioList = null;
		List<Object[]> protfolioListWithoutPagination = null;
		List<String> boardName = new ArrayList<>();
		List<UUID> userList = new ArrayList<>();
		String length = "0";
		if (paginationVO.getFilterValue() != null && paginationVO.getFilterValue().length != 0) {
			for (FilterValueVO fValue : paginationVO.getFilterValue()) {
				if (StringUtils.equals(fValue.getFilterIdColumn(), BOARDNAME)) {
					boardName.add(fValue.getFilterIdColumnValue());
				}

				if (StringUtils.equals(fValue.getFilterIdColumn(), ASSIGNTO)) {
					userList.add(UUID.fromString(fValue.getFilterIdColumnValue()));
				}
			}
		}
		FilterDateVO filterDateVO = getStartAndEndDate(paginationVO);
		if (boardName.isEmpty() && userList.isEmpty()) {
			if (paginationVO.getTaskboardIdList() == null || paginationVO.getTaskboardIdList().isEmpty()) {
				protfolioList = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
						? taskboardRepository.getPortfolioForAllWorkspaceWithPagination(userVO.getUserId(),
								YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable)
						: taskboardRepository.getPortfolioForAllWorkspaceWithPaginationAndDateFilter(userVO.getUserId(),
								YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable,
								Timestamp.valueOf(filterDateVO.getStartDate()),
								Timestamp.valueOf(filterDateVO.getEndDate()));
				protfolioListWithoutPagination = (filterDateVO.getStartDate() == null
						&& filterDateVO.getEndDate() == null)
								? taskboardRepository.getPortfolioForAllWorkspaceWithoutPagination(userVO.getUserId(),
										YorosisContext.get().getTenantId(), YorosisConstants.YES)
								: taskboardRepository.getPortfolioForAllWorkspaceWithoutPaginationAndDateFilter(
										userVO.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES,
										Timestamp.valueOf(filterDateVO.getStartDate()),
										Timestamp.valueOf(filterDateVO.getEndDate()));
			} else {
				protfolioList = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
						? taskboardRepository.getPortfolioByTaskboardIdListWithPagination(userVO.getUserId(),
								paginationVO.getTaskboardIdList(), YorosisContext.get().getTenantId(),
								YorosisConstants.YES, pageable)
						: taskboardRepository.getPortfolioByTaskboardIdListWithPaginationAndDateFilter(
								userVO.getUserId(), paginationVO.getTaskboardIdList(),
								YorosisContext.get().getTenantId(), YorosisConstants.YES, pageable,
								Timestamp.valueOf(filterDateVO.getStartDate()),
								Timestamp.valueOf(filterDateVO.getEndDate()));
				protfolioListWithoutPagination = (filterDateVO.getStartDate() == null
						&& filterDateVO.getEndDate() == null)
								? taskboardRepository.getPortfolioByTaskboardIdListWithoutPagination(userVO.getUserId(),
										paginationVO.getTaskboardIdList(), YorosisContext.get().getTenantId(),
										YorosisConstants.YES)
								: taskboardRepository.getPortfolioByTaskboardIdListWithoutPaginationAndDateFilter(
										userVO.getUserId(), paginationVO.getTaskboardIdList(),
										YorosisContext.get().getTenantId(), YorosisConstants.YES,
										Timestamp.valueOf(filterDateVO.getStartDate()),
										Timestamp.valueOf(filterDateVO.getEndDate()));
			}

			for (Object[] object : protfolioList) {
				String taskboardName = object[0].toString();
				UUID taskboardId = UUID.fromString(object[1].toString());
				Long incompletedTaskCount = Long.valueOf(object[2].toString());
				Long completedTaskCount = Long.valueOf(object[3].toString());
				Long totalTaskCount = Long.valueOf(object[4].toString());
				UUID workspaceId = UUID.fromString(object[5].toString());
				String taskboardKey = object[6].toString();
				List<String> ownerNameList = taskboardService.getOwnerNameList(object[1].toString());
				PortfolioVO portfolioVO = PortfolioVO.builder().taskboardId(taskboardId)
						.incompletedTaskCount(incompletedTaskCount).completetedTaskCount(completedTaskCount)
						.totalTaskCount(totalTaskCount).taskboardName(taskboardName).workspaceId(workspaceId)
						.ownerIdList(ownerNameList).taskboardKey(taskboardKey).build();
				portfolioVOList.add(portfolioVO);
			}

			length = String.valueOf(protfolioListWithoutPagination.size());
		} else {

			portfolioVOList = getPortfolioList(userVO, filterDateVO);

			if (!boardName.isEmpty() && !portfolioVOList.isEmpty()) {
				portfolioVOList = portfolioVOList.stream().filter(f -> (boardName.contains(f.getTaskboardName())))
						.collect(Collectors.toList());
				length = String.valueOf(portfolioVOList.size());
			}

			if (!userList.isEmpty() && !portfolioVOList.isEmpty()) {
				portfolioVOList = portfolioVOList.stream()
						.filter(f -> !taskboardService.getOwnerIdList(f.getTaskboardId().toString()).stream()
								.filter(t -> userList.contains(t)).collect(Collectors.toList()).isEmpty())
						.collect(Collectors.toList());
				length = String.valueOf(portfolioVOList.size());
			}
		}

		return PortfolioTableDataVO.builder().portfolioList(portfolioVOList).totalRecords(length).build();
	}

	private List<PortfolioVO> getPortfolioList(UsersVO userVO, FilterDateVO filterDateVO) {
		List<PortfolioVO> portfolioVOList = new ArrayList<>();
		List<Object[]> portfolioForAllWorkspaceWithoutPagination = (filterDateVO.getStartDate() == null
				&& filterDateVO.getEndDate() == null)
						? taskboardRepository.getPortfolioForAllWorkspaceWithoutPagination(userVO.getUserId(),
								YorosisContext.get().getTenantId(), YorosisConstants.YES)
						: taskboardRepository.getPortfolioForAllWorkspaceWithoutPaginationAndDateFilter(
								userVO.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES,
								Timestamp.valueOf(filterDateVO.getStartDate()),
								Timestamp.valueOf(filterDateVO.getEndDate()));
		for (Object[] object : portfolioForAllWorkspaceWithoutPagination) {
			String taskboardName = object[0].toString();
			UUID taskboardId = UUID.fromString(object[1].toString());
			Long incompletedTaskCount = Long.valueOf(object[2].toString());
			Long completedTaskCount = Long.valueOf(object[3].toString());
			Long totalTaskCount = Long.valueOf(object[4].toString());
			UUID workspaceId = UUID.fromString(object[5].toString());
			String taskboardKey = object[6].toString();
			List<String> ownerNameList = taskboardService.getOwnerNameList(object[1].toString());
			PortfolioVO portfolioVO = PortfolioVO.builder().taskboardId(taskboardId)
					.incompletedTaskCount(incompletedTaskCount).completetedTaskCount(completedTaskCount)
					.totalTaskCount(totalTaskCount).taskboardName(taskboardName).workspaceId(workspaceId)
					.ownerIdList(ownerNameList).taskboardKey(taskboardKey).build();
			portfolioVOList.add(portfolioVO);
		}
		return portfolioVOList;
	}

	private Dashboard constructDashboardVoToDto(UsersVO userVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return Dashboard.builder().ownerUserId(userVO.getUserId()).createdBy(YorosisContext.get().getUserName())
				.modifiedBy(YorosisContext.get().getUserName()).createdOn(timestamp).modifiedOn(timestamp)
				.tenantId(YorosisContext.get().getTenantId()).activeFlag(YorosisConstants.YES).build();
	}

	private Dashboard constructDashboardWithoutWidgetVoToDto(UsersVO userVO, DashboardVO dashboardVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return Dashboard.builder().ownerUserId(userVO.getUserId()).createdBy(YorosisContext.get().getUserName())
				.modifiedBy(YorosisContext.get().getUserName()).createdOn(timestamp).modifiedOn(timestamp)
				.tenantId(YorosisContext.get().getTenantId()).activeFlag(YorosisConstants.YES)
				.dashboardName(dashboardVO.getDashboardName()).dashboardId(dashboardVO.getDashbaordId()).build();
	}

	private DashboardWidgetVO constructDashboardWidgetDtoToVo(DashboardWidgets dashboardWidgets) {
		return DashboardWidgetVO.builder().id(dashboardWidgets.getId())
				.dashboardId(dashboardWidgets.getDashboard().getId()).widgetName(dashboardWidgets.getWidgetName())
				.rownum(dashboardWidgets.getRowNum()).colnum(dashboardWidgets.getColumnNum())
				.widgetType(dashboardWidgets.getWidgetType()).build();
	}

	@Transactional
	public ResponseStringVO saveSwapWidgets(List<DashboardSwapVo> dashboardSwapVoList, UUID dashboardId) {
		List<DashboardWidgets> dashboardWidgetsList = dashboardWidgetRepository.getDashboardWidgetsByDashboardId(
				dashboardId, YorosisConstants.YES, YorosisContext.get().getTenantId());
		if (dashboardWidgetsList != null && !dashboardWidgetsList.isEmpty() && dashboardSwapVoList != null
				&& !dashboardSwapVoList.isEmpty()) {
			dashboardSwapVoList.stream().forEach(ds -> {
				dashboardWidgetsList.stream().forEach(d -> {
					if (ds.getWidgetId() != null && d.getId() != null
							&& StringUtils.equals(ds.getWidgetId().toString(), d.getId().toString())) {
						d.setColumnNum(ds.getColumnum());
						d.setRowNum(ds.getRownum());
					}
				});
			});
			dashboardWidgetRepository.saveAll(dashboardWidgetsList);
			return ResponseStringVO.builder().response("Dashboard widgets swaped successfully").build();
		}
		return ResponseStringVO.builder().response("No dashboard widgets to swap").build();
	}

	@Transactional
	public ResponseStringVO deleteWidget(DashboardWidgetVO dashboardWidgetVO) {
		List<DashboardWidgets> dashboardWidgets = dashboardWidgetRepository
				.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(dashboardWidgetVO.getId(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES);

		dashboardWidgetRepository.deleteAll(dashboardWidgets);

		List<DashboardWidgets> dashboardWidgetsList = dashboardWidgetRepository
				.getDashboardWidgetsOrderByRowAndColumnNum(dashboardWidgetVO.getDashboardId(), YorosisConstants.YES,
						YorosisContext.get().getTenantId());

		for (int i = 0; i < dashboardWidgetsList.size(); i++) {
			double index = (double) i / 2;
			double rowNum = Math.floor(index);
			dashboardWidgetsList.get(i).setRowNum((long) rowNum);
			dashboardWidgetsList.get(i).setColumnNum((i % 2 == 0) ? 0L : 1L);
		}

		return ResponseStringVO.builder().response("Widgets removed successfully").build();
	}

	@Transactional
	public ResponseStringVO saveDashboardWithoutWidget(DashboardVO dashboardVO) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		if (dashboardVO.getId() == null) {
			Dashboard dashboard = constructDashboardWithoutWidgetVoToDto(userVO, dashboardVO);
			dashboard = dashboardRepository.save(dashboard);
			return ResponseStringVO.builder().id(dashboard.getId()).response("Dashboard saved successfully").build();
		} else {
			Dashboard dashboard = dashboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
					dashboardVO.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (dashboard != null) {
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				dashboard.setDashboardName(dashboardVO.getDashboardName());
				dashboard.setModifiedBy(YorosisContext.get().getUserName());
				dashboard.setModifiedOn(timestamp);
				dashboard = dashboardRepository.save(dashboard);
				return ResponseStringVO.builder().id(dashboard.getId()).response("Dashboard updated successfully")
						.build();
			}
		}
		return ResponseStringVO.builder().id(null).response("Dashboard not saved").build();
	}

	@Transactional
	public ResponseStringVO saveDashboard(DashboardVO dashboardVO) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		List<DashboardWidgets> dashboardWidgetsList = new ArrayList<>();
		Dashboard dashboard = null;
		String response = null;
		if (dashboardVO.getId() == null) {
			dashboard = constructDashboardVoToDto(userVO);
			dashboard.setDashboardName(dashboardVO.getDashboardName());
			dashboard.setDashboardId(dashboardVO.getDashbaordId());
			response = "Dashboard saved successfully";
		} else {
			dashboard = dashboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(dashboardVO.getId(),
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			List<DashboardWidgets> dashboardWidgets = dashboard.getDashboardWidgets();
			dashboardWidgetRepository.deleteAll(dashboardWidgets);
			response = "Dashboard updated successfully";
		}
		for (DashboardWidgetVO dashboardWidgetVO : dashboardVO.getDashboardWidgets()) {
			dashboardWidgetsList.add(DashboardWidgets.builder().widgetName(dashboardWidgetVO.getWidgetName())
					.widgetType(dashboardWidgetVO.getWidgetType()).dashboard(dashboard)
					.createdBy(YorosisContext.get().getUserName()).id(dashboardWidgetVO.getId())
					.rowNum(dashboardWidgetVO.getRownum()).columnNum(dashboardWidgetVO.getColnum())
					.modifiedBy(YorosisContext.get().getUserName()).createdOn(timestamp).modifiedOn(timestamp)
					.tenantId(YorosisContext.get().getTenantId()).activeFlag(YorosisConstants.YES).build());
		}
		dashboard.setDashboardWidgets(dashboardWidgetsList);
		dashboardRepository.save(dashboard);
		return ResponseStringVO.builder().id(dashboard.getId()).response(response).build();

	}

	@Transactional
	public List<DashboardVO> getDashboardList() {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<Dashboard> dashboardList = dashboardRepository
				.findByOwnerUserIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(userVO.getUserId(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
		List<DashboardVO> dashboardVOList = new ArrayList<>();
		for (Dashboard dashboard : dashboardList) {
			List<DashboardWidgetVO> dashboardWidgetsVoList = dashboard.getDashboardWidgets().stream()
					.filter(d -> StringUtils.equalsIgnoreCase(d.getActiveFlag(), YorosisConstants.YES))
					.map(this::constructDashboardWidgetDtoToVo).collect(Collectors.toList());
			dashboardVOList.add(DashboardVO.builder().dashboardName(dashboard.getDashboardName()).id(dashboard.getId())
					.userId(dashboard.getOwnerUserId()).dashboardWidgets(dashboardWidgetsVoList)
					.dashbaordId(dashboard.getDashboardId()).build());
		}
		return dashboardVOList;
	}

	@Transactional
	public DashboardVO getDashboard(UUID id) {
		Dashboard dashboard = dashboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(id,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		List<DashboardWidgets> dashboardWidgetsList = dashboardWidgetRepository
				.getDashboardWidgetsOrderByRowAndColumnNum(id, YorosisConstants.YES,
						YorosisContext.get().getTenantId());
		List<DashboardWidgetVO> dashboardWidgetsVoList = dashboardWidgetsList.stream()
				.map(this::constructDashboardWidgetDtoToVo).collect(Collectors.toList());
		return DashboardVO.builder().dashboardName(dashboard.getDashboardName()).id(dashboard.getId())
				.userId(dashboard.getOwnerUserId()).dashboardWidgets(dashboardWidgetsVoList)
				.dashbaordId(dashboard.getDashboardId()).build();
	}

	@Transactional
	public List<DashboardVO> getDashboardNameList() {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<Dashboard> dashboardList = dashboardRepository
				.findByOwnerUserIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(userVO.getUserId(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
		return dashboardList.stream().filter(d -> StringUtils.equalsIgnoreCase(d.getActiveFlag(), YorosisConstants.YES))
				.map(t -> DashboardVO.builder().id(t.getId()).dashboardName(t.getDashboardName())
						.dashbaordId(t.getDashboardId()).build())
				.sorted(Comparator.comparing(DashboardVO::getDashboardName)).collect(Collectors.toList());
	}

	@Transactional
	public List<BoardNameVo> getTaskboardNames() {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<BoardNameVo> boardNameList = new ArrayList<>();
		List<Object[]> taskboardNameListForWidget = taskboardRepository.getTaskboardNameListForWidget(
				userVO.getUserId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		for (Object[] obj : taskboardNameListForWidget) {

			UUID taskBoardId = obj[0] != null ? UUID.fromString(obj[0].toString()) : null;
			String boardName = obj[1] != null ? obj[1].toString() : "";
			String workspaceId = obj[2] != null ? obj[2].toString() : "";
			Workspace workspace = workspaceRepository.getBasedonIdAndTenantIdAndActiveFlag(UUID.fromString(workspaceId),
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			String workspaceName = workspace != null ? workspace.getWorkspaceName() : "";
			BoardNameVo boardNameVo = BoardNameVo.builder()
					.boardName(workspaceName != null ? boardName + " - " + workspaceName : boardName)
					.taskBoardId(taskBoardId).name(boardName).build();
			boardNameList.add(boardNameVo);
		}
		return boardNameList;
	}

	@Transactional
	public List<BoardNameVo> getActiveTaskboardNames() {
		List<BoardNameVo> boardNameList = new ArrayList<>();
		List<Object[]> taskboardNameListForWidget = taskboardRepository
				.getTaskboardNameListForAllWorkplace(YorosisContext.get().getTenantId(), YorosisConstants.YES);
		for (Object[] obj : taskboardNameListForWidget) {

			UUID taskBoardId = obj[0] != null ? UUID.fromString(obj[0].toString()) : null;
			String boardName = obj[1] != null ? obj[1].toString() : "";
			String workspaceName = obj[2] != null ? obj[2].toString() : "";
			BoardNameVo boardNameVo = BoardNameVo.builder().boardName(boardName).taskBoardId(taskBoardId)
					.name(StringUtils.isBlank(workspaceName) ? boardName : boardName + " - " + workspaceName).build();
			boardNameList.add(boardNameVo);
		}
		return boardNameList;
	}

	@Transactional
	public TaskboardTaskVo getTimeTracking(PaginationVO vo) {
		LocalDate today = LocalDate.now();
		if (StringUtils.equals(vo.getTaskStatus(), "pastDue")) {
			return getTaskBoardTask(today.minusYears(10).atStartOfDay(), LocalDateTime.now(), vo);
		} else if (StringUtils.equals(vo.getTaskStatus(), "dueToday")) {
			return getTaskBoardTask(today.atStartOfDay(), today.plusDays(1).atStartOfDay(), vo);
		} else if (StringUtils.equals(vo.getTaskStatus(), "dueTomorrow")) {
			return getTaskBoardTask(today.plusDays(1).atStartOfDay(), today.plusDays(2).atStartOfDay(), vo);
		} else if (StringUtils.equals(vo.getTaskStatus(), "dueInSevenDays")) {
			return getTaskBoardTask(today.atStartOfDay(), today.plusDays(7).atStartOfDay(), vo);
		}
		return TaskboardTaskVo.builder().build();
	}

	public FilterDateVO getStartAndEndDate(PaginationVO vo) {
		LocalDate today = LocalDate.now();
		if (StringUtils.equals(vo.getFilterType(), "today")) {
			return FilterDateVO.builder().startDate(today.atStartOfDay()).endDate(today.plusDays(1).atStartOfDay())
					.build();
		} else if (StringUtils.equals(vo.getFilterType(), "yesterday")) {
			return FilterDateVO.builder().startDate(today.minusDays(1).atStartOfDay()).endDate(today.atStartOfDay())
					.build();
		} else if (StringUtils.equals(vo.getFilterType(), "lastWeek")) {
			return FilterDateVO.builder().startDate(today.minusDays(7).atStartOfDay())
					.endDate(today.plusDays(1).atStartOfDay()).build();
		} else if (StringUtils.equals(vo.getFilterType(), "lastMonth")) {
			return FilterDateVO.builder().startDate(today.minusMonths(1).atStartOfDay())
					.endDate(today.plusDays(1).atStartOfDay()).build();
		} else if (StringUtils.equals(vo.getFilterType(), "last2Month")) {
			return FilterDateVO.builder().startDate(today.minusDays(60).atStartOfDay())
					.endDate(today.plusDays(1).atStartOfDay()).build();
		} else if (StringUtils.equals(vo.getFilterType(), "betweenDates")) {
			return FilterDateVO.builder().startDate(vo.getStartDate()).endDate(vo.getEndDate()).build();
		} else if (StringUtils.equals(vo.getFilterType(), "all")) {
			return FilterDateVO.builder().startDate(null).endDate(null).build();
		}

		return FilterDateVO.builder().build();
	}

	public FilterDateVO getStartAndEndDate(DashboardChartVO vo) {
		LocalDate today = LocalDate.now();
		if (StringUtils.equals(vo.getFilterType(), "today")) {
			return FilterDateVO.builder().startDate(today.atStartOfDay()).endDate(today.plusDays(1).atStartOfDay())
					.build();
		} else if (StringUtils.equals(vo.getFilterType(), "yesterday")) {
			return FilterDateVO.builder().startDate(today.minusDays(1).atStartOfDay()).endDate(today.atStartOfDay())
					.build();
		} else if (StringUtils.equals(vo.getFilterType(), "lastWeek")) {
			return FilterDateVO.builder().startDate(today.minusDays(7).atStartOfDay())
					.endDate(today.plusDays(1).atStartOfDay()).build();
		} else if (StringUtils.equals(vo.getFilterType(), "lastMonth")) {
			return FilterDateVO.builder().startDate(today.minusMonths(1).atStartOfDay())
					.endDate(today.plusDays(1).atStartOfDay()).build();
		} else if (StringUtils.equals(vo.getFilterType(), "last2Month")) {
			return FilterDateVO.builder().startDate(today.minusDays(60).atStartOfDay())
					.endDate(today.plusDays(1).atStartOfDay()).build();
		} else if (StringUtils.equals(vo.getFilterType(), "betweenDates")) {
			return FilterDateVO.builder().startDate(vo.getStartDate()).endDate(vo.getEndDate()).build();
		} else if (StringUtils.equals(vo.getFilterType(), "all")) {
			return FilterDateVO.builder().startDate(null).endDate(null).build();
		}

		return FilterDateVO.builder().build();
	}

	private TaskboardTaskVo getTaskBoardTask(LocalDateTime startDate, LocalDateTime endDate, PaginationVO vo) {
		int taskboardTaskCount = 0;
		UsersVO userVO = userService.getLoggedInUserDetails();
		if (vo.getTaskboardIdList() == null || vo.getTaskboardIdList().isEmpty()) {
			taskboardTaskCount = taskboardTaskRepository.getTimeTrackingCountForAllWorkspace(userVO.getUserId(),
					YorosisContext.get().getTenantId(), YorosisConstants.YES, Timestamp.valueOf(startDate),
					Timestamp.valueOf(endDate));
		} else if (vo.getTaskboardIdList() != null && !vo.getTaskboardIdList().isEmpty()) {
			taskboardTaskCount = taskboardTaskRepository.getTimeTrackingCountByTaskboardIdList(vo.getTaskboardIdList(),
					YorosisContext.get().getTenantId(), YorosisConstants.YES, Timestamp.valueOf(startDate),
					Timestamp.valueOf(endDate));
		}
		return TaskboardTaskVo.builder().totalRecords(String.valueOf(taskboardTaskCount)).build();

	}

	@Transactional
	public AllTaskVO getWorkflowDataForTimeTracking(PaginationVO vo) {
		LocalDate today = LocalDate.now();
		if (StringUtils.equals(vo.getTaskStatus(), "all")) {
			return getWorkflowTask(today.minusDays(60).atStartOfDay(), today.plusDays(1).atStartOfDay(), vo);
		} else if (StringUtils.equals(vo.getTaskStatus(), "pastDue")) {
			return getWorkflowTask(today.minusYears(10).atStartOfDay(), LocalDateTime.now(), vo);
		} else if (StringUtils.equals(vo.getTaskStatus(), "dueToday")) {
			return getWorkflowTask(today.atStartOfDay(), today.plusDays(1).atStartOfDay(), vo);
		} else if (StringUtils.equals(vo.getTaskStatus(), "dueTomorrow")) {
			return getWorkflowTask(today.plusDays(1).atStartOfDay(), today.plusDays(2).atStartOfDay(), vo);
		} else if (StringUtils.equals(vo.getTaskStatus(), "dueInSevenDays")) {
			return getWorkflowTask(today.atStartOfDay(), today.plusDays(7).atStartOfDay(), vo);
		}
		return AllTaskVO.builder().build();
	}

	private AllTaskVO getWorkflowTask(LocalDateTime startDate, LocalDateTime endDate, PaginationVO vo) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = landingPageService.getGroupAsUUID(userVO);
		int workflowTaskCount = processInstanceTaskRepo.getProcessInstanceTaskCountForAllWorkspace(userVO.getUserId(),
				userGroupIdsList, YorosisContext.get().getTenantId(), startDate, endDate, YorosisConstants.YES);
		return AllTaskVO.builder().totalRecords(String.valueOf(workflowTaskCount)).build();
	}

	@Transactional
	public ResponseStringVO checkDashboardName(String dashboardName) {
		List<Dashboard> dashboardList = dashboardRepository
				.findByDashboardNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(dashboardName,
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (dashboardList != null && !dashboardList.isEmpty()) {
			return ResponseStringVO.builder().response("Dashboard name already exist").build();
		}
		return ResponseStringVO.builder().response("New Name").build();
	}

	@Transactional
	public AllTaskVO getWorkflowTasksList(PaginationVO pagination) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = landingPageService.getGroupAsUUID(userVO);
		LocalDateTime date = LocalDateTime.now().plus(2, ChronoUnit.YEARS);
		Pageable pageable = taskListService.getPageableObject(pagination);
		List<WorkflowVO> workflowTasksVo = new ArrayList<>();
		List<ProcessInstanceTask> processInstanceTask = null;
		String userName = taskListService.getName(userVO);
		int count = 0;
		FilterDateVO filterDateVO = getStartAndEndDate(pagination);
		processInstanceTask = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
				? processInstanceTaskRepo.getProcessInstanceTaskForAllWorkspacePageable(userVO.getUserId(),
						userGroupIdsList, YorosisContext.get().getTenantId(), date, pageable, YorosisConstants.YES)
				: processInstanceTaskRepo.getProcessInstanceTaskForAllWorkspacePageableWithDateFilter(
						userVO.getUserId(), userGroupIdsList, YorosisContext.get().getTenantId(), date, pageable,
						YorosisConstants.YES, Timestamp.valueOf(filterDateVO.getStartDate()),
						Timestamp.valueOf(filterDateVO.getEndDate()));

		count = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
				? processInstanceTaskRepo.getProcessInstanceTaskCountForAllWorkspace(userVO.getUserId(),
						userGroupIdsList, YorosisContext.get().getTenantId(), date, YorosisConstants.YES)

				: processInstanceTaskRepo.getProcessInstanceTaskCountForAllWorkspaceWithDateFilter(userVO.getUserId(),
						userGroupIdsList, YorosisContext.get().getTenantId(), date, YorosisConstants.YES,
						Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
		processInstanceTask.stream()
				.filter(t -> workflowTasksVo.add(taskListService.getWorkFlowTaskVo(userVO, t, userName)))
				.collect(Collectors.toList());
		return AllTaskVO.builder().workflowTasksVo(workflowTasksVo).totalRecords(String.valueOf(count)).build();
	}

	@Transactional
	public List<PieChartVO> getWorkflowTasksByUsers(DashboardChartVO dashboardChartVO) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = landingPageService.getGroupAsUUID(userVO);
		LocalDateTime date = LocalDateTime.now().plus(2, ChronoUnit.YEARS);
		List<PieChartVO> pieChartVO = new ArrayList<>();
		List<WorkflowVO> workflowTasksVo = new ArrayList<>();
		List<ProcessInstanceTask> processInstanceTask = null;
		String userName = taskListService.getName(userVO);
		FilterDateVO filterDateVO = getStartAndEndDate(dashboardChartVO);
		processInstanceTask = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
				? processInstanceTaskRepo.getProcessInstanceTaskForAllWorkspace(userVO.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), date, YorosisConstants.YES)
				: processInstanceTaskRepo.getProcessInstanceTaskForAllWorkspaceWithDateFilter(userVO.getUserId(),
						userGroupIdsList, YorosisContext.get().getTenantId(), date, YorosisConstants.YES,
						Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));

		if (!processInstanceTask.isEmpty()) {
			processInstanceTask.stream()
					.filter(t -> workflowTasksVo.add(taskListService.getWorkFlowTaskVo(userVO, t, userName)))
					.collect(Collectors.toList());
			log.info("count:{}", workflowTasksVo.size());
		}

		Map<String, List<WorkflowVO>> taskNamesListByUsers = getTaskListByUsers(workflowTasksVo);
		for (Map.Entry<String, List<WorkflowVO>> entry : taskNamesListByUsers.entrySet()) {
			Double y = Double.valueOf(entry.getValue().size());
			pieChartVO.add(PieChartVO.builder().name(entry.getKey()).y(y).build());
		}
		return pieChartVO;
	}

	@Transactional
	public BarChartVO getWorkflowTasksByUsersForBarChart(DashboardChartVO dashboardChartVO) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = landingPageService.getGroupAsUUID(userVO);
		LocalDateTime date = LocalDateTime.now().plus(2, ChronoUnit.YEARS);
		List<WorkflowVO> workflowTasksVo = new ArrayList<>();
		String userName = taskListService.getName(userVO);
		List<ProcessInstanceTask> processInstanceTask = null;
		FilterDateVO filterDateVO = getStartAndEndDate(dashboardChartVO);
		processInstanceTask = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
				? processInstanceTaskRepo.getProcessInstanceTaskForAllWorkspace(userVO.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), date, YorosisConstants.YES)
				: processInstanceTaskRepo.getProcessInstanceTaskForAllWorkspaceWithDateFilter(userVO.getUserId(),
						userGroupIdsList, YorosisContext.get().getTenantId(), date, YorosisConstants.YES,
						Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
		if (!processInstanceTask.isEmpty()) {
			processInstanceTask.stream()
					.filter(t -> workflowTasksVo.add(taskListService.getWorkFlowTaskVo(userVO, t, userName)))
					.collect(Collectors.toList());
			log.info("count:{}", workflowTasksVo.size());
		}

		List<String> xAxisCategoriesList = new ArrayList<>();
		List<PlotPointAndColorVO> dataList = new ArrayList<>();
		Map<String, List<WorkflowVO>> taskNamesListByUsers = getTaskListByUsers(workflowTasksVo);
		for (Map.Entry<String, List<WorkflowVO>> entry : taskNamesListByUsers.entrySet()) {
			dataList.add(PlotPointAndColorVO.builder().y(Long.valueOf(entry.getValue().size())).build());
			xAxisCategoriesList.add(entry.getKey());
		}
		return BarChartVO.builder().xAxisCategories(xAxisCategoriesList).name("Total Task").data(dataList).build();
	}

	@Transactional
	public List<PieChartVO> getWorkflowTasksByTeams(DashboardChartVO dashboardChartVO) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = landingPageService.getGroupAsUUID(userVO);
		LocalDateTime date = LocalDateTime.now().plus(2, ChronoUnit.YEARS);
		List<PieChartVO> pieChartVO = new ArrayList<>();
		List<WorkflowVO> workflowTasksVo = new ArrayList<>();
		List<ProcessInstanceTask> processInstanceTask = null;
		String userName = taskListService.getName(userVO);
		FilterDateVO filterDateVO = getStartAndEndDate(dashboardChartVO);
		processInstanceTask = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
				? processInstanceTaskRepo.getProcessInstanceTaskForAllWorkspace(userVO.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), date, YorosisConstants.YES)
				: processInstanceTaskRepo.getProcessInstanceTaskForAllWorkspaceWithDateFilter(userVO.getUserId(),
						userGroupIdsList, YorosisContext.get().getTenantId(), date, YorosisConstants.YES,
						Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
		if (!processInstanceTask.isEmpty()) {
			processInstanceTask.stream()
					.filter(t -> workflowTasksVo.add(taskListService.getWorkFlowTaskVo(userVO, t, userName)))
					.collect(Collectors.toList());
			log.info("count:{}", workflowTasksVo.size());
		}

		Map<String, List<WorkflowVO>> taskNamesListByTeams = getTaskListByTeams(workflowTasksVo);
		for (Map.Entry<String, List<WorkflowVO>> entry : taskNamesListByTeams.entrySet()) {
			Double y = Double.valueOf(entry.getValue().size());
			pieChartVO.add(PieChartVO.builder().name(entry.getKey()).y(y).build());
		}
		return pieChartVO;
	}

	@Transactional
	public BarChartVO getWorkflowTasksByTeamsForBarChart(DashboardChartVO dashboardChartVO) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = landingPageService.getGroupAsUUID(userVO);
		LocalDateTime date = LocalDateTime.now().plus(2, ChronoUnit.YEARS);
		List<WorkflowVO> workflowTasksVo = new ArrayList<>();
		List<ProcessInstanceTask> processInstanceTask = null;
		String userName = taskListService.getName(userVO);
		FilterDateVO filterDateVO = getStartAndEndDate(dashboardChartVO);
		processInstanceTask = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
				? processInstanceTaskRepo.getProcessInstanceTaskForAllWorkspace(userVO.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), date, YorosisConstants.YES)
				: processInstanceTaskRepo.getProcessInstanceTaskForAllWorkspaceWithDateFilter(userVO.getUserId(),
						userGroupIdsList, YorosisContext.get().getTenantId(), date, YorosisConstants.YES,
						Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
		if (!processInstanceTask.isEmpty()) {
			processInstanceTask.stream()
					.filter(t -> workflowTasksVo.add(taskListService.getWorkFlowTaskVo(userVO, t, userName)))
					.collect(Collectors.toList());
			log.info("count:{}", workflowTasksVo.size());
		}

		List<String> xAxisCategoriesList = new ArrayList<>();
		List<PlotPointAndColorVO> dataList = new ArrayList<>();
		Map<String, List<WorkflowVO>> taskNamesListByteams = getTaskListByTeams(workflowTasksVo);
		for (Map.Entry<String, List<WorkflowVO>> entry : taskNamesListByteams.entrySet()) {
			dataList.add(PlotPointAndColorVO.builder().y(Long.valueOf(entry.getValue().size())).build());
			xAxisCategoriesList.add(entry.getKey());
		}
		return BarChartVO.builder().xAxisCategories(xAxisCategoriesList).name("Total Task").data(dataList).build();
	}

	@Transactional
	public TableData getProcessInstanceList(PaginationVO vo) {
		List<Map<String, String>> list = new ArrayList<>();
		List<ProcessInstance> processInstanceList = null;
		List<ProcessInstance> processInstanceListFilter = null;
		UsersVO userVO = userService.getLoggedInUserDetails();
		FilterDateVO filterDateVO = getStartAndEndDate(vo);
		if (vo.getFilterValue().length != 0) {
			processInstanceListFilter = (vo.getStartDate() == null && vo.getEndDate() == null)
					? processInstanceRepo.getProcessInstanceForAllWorkplace(vo.getTaskStatus(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES, userVO.getUserId())
					: processInstanceRepo.getProcessInstanceForAllWorkplaceWithDateFilter(vo.getTaskStatus(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES, userVO.getUserId(),
							Timestamp.valueOf(filterDateVO.getStartDate()),
							Timestamp.valueOf(filterDateVO.getEndDate()));

			return processInstanceService.getTasks(vo, processInstanceListFilter);
		}
		Pageable pageable = processInstanceService.getPageable(vo, false);
		processInstanceList = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
				? processInstanceRepo.getProcessInstanceForAllWorkplacePageble(vo.getTaskStatus(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES, userVO.getUserId(), pageable)
				: processInstanceRepo.getProcessInstanceForAllWorkplacePagebleWithDateFilter(vo.getTaskStatus(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES, userVO.getUserId(), pageable,
						Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));

		int totalCount = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
				? processInstanceRepo.getCountForProcessInstanceForAllWorkplace(vo.getTaskStatus(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES, userVO.getUserId())
				: processInstanceRepo.getCountForProcessInstanceForAllWorkplaceWithDateFilter(vo.getTaskStatus(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES, userVO.getUserId(),
						Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
		for (ProcessInstance procInstance : processInstanceList) {
			list.add(processInstanceService.getTaskWithoutFilter(procInstance));
		}
		return TableData.builder().data(list).totalRecords(String.valueOf(totalCount)).build();
	}

	@Transactional
	public TableData getProcessInstanceListCount(PaginationVO vo) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		FilterDateVO filterDateVO = getStartAndEndDate(vo);
		int totalCount = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
				? processInstanceRepo.getCountForProcessInstanceForAllWorkplace(vo.getTaskStatus(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES, userVO.getUserId())
				: processInstanceRepo.getCountForProcessInstanceForAllWorkplaceWithDateFilter(vo.getTaskStatus(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES, userVO.getUserId(),
						Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));
		return TableData.builder().totalRecords(String.valueOf(totalCount)).build();
	}

	@Transactional
	public List<PieChartVO> getAssigneeTaskByTaskname(DashboardChartVO dashboardChartVO) {
		List<PieChartVO> pieChartVO = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = landingPageService.getGroupAsUUID(userVO);
		LocalDateTime date = LocalDateTime.now().plus(2, ChronoUnit.YEARS);
		List<ProcessInstanceTask> processInstanceTask = null;
		FilterDateVO filterDateVO = getStartAndEndDate(dashboardChartVO);
		processInstanceTask = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
				? processInstanceTaskRepo.getProcessInstanceTaskForAllWorkspace(userVO.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), date, YorosisConstants.YES)
				: processInstanceTaskRepo.getProcessInstanceTaskForAllWorkspaceWithDateFilter(userVO.getUserId(),
						userGroupIdsList, YorosisContext.get().getTenantId(), date, YorosisConstants.YES,
						Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));

		List<TaskNameListVO> taskNamesList = getTaskNamesList(processInstanceTask);
		if (!taskNamesList.isEmpty()) {
			for (TaskNameListVO object : taskNamesList) {

				if (object.getTaskName() != null) {
					Double y = Double.valueOf(object.getUserCount());
					pieChartVO.add(PieChartVO.builder().name(object.getTaskName()).y(y).build());
				} else {
					pieChartVO.add(PieChartVO.builder().build());
				}
			}
		}
		return pieChartVO;
	}

	@Transactional
	public BarChartVO getAssigneeTaskByTasknameForBarChart(DashboardChartVO dashboardChartVO) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = landingPageService.getGroupAsUUID(userVO);
		LocalDateTime date = LocalDateTime.now().plus(2, ChronoUnit.YEARS);
		List<ProcessInstanceTask> processInstanceTask = null;
		FilterDateVO filterDateVO = getStartAndEndDate(dashboardChartVO);
		processInstanceTask = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
				? processInstanceTaskRepo.getProcessInstanceTaskForAllWorkspace(userVO.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), date, YorosisConstants.YES)
				: processInstanceTaskRepo.getProcessInstanceTaskForAllWorkspaceWithDateFilter(userVO.getUserId(),
						userGroupIdsList, YorosisContext.get().getTenantId(), date, YorosisConstants.YES,
						Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));

		List<TaskNameListVO> taskNamesList = getTaskNamesList(processInstanceTask);
		List<String> xAxisCategoriesList = new ArrayList<>();
		List<PlotPointAndColorVO> dataList = new ArrayList<>();
		if (!taskNamesList.isEmpty()) {
			for (TaskNameListVO object : taskNamesList) {
				dataList.add(PlotPointAndColorVO.builder().y(Long.valueOf(object.getUserCount())).build());
				xAxisCategoriesList.add(object.getTaskName());
			}
		}
		return BarChartVO.builder().xAxisCategories(xAxisCategoriesList).name("Total Task").data(dataList).build();
	}

	@Transactional
	public List<PieChartVO> getTeamsTaskByTaskname(DashboardChartVO dashboardChartVO) {
		List<PieChartVO> pieChartVO = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = landingPageService.getGroupAsUUID(userVO);
		LocalDateTime date = LocalDateTime.now().plus(2, ChronoUnit.YEARS);
		List<ProcessInstanceTask> processInstanceTask = null;
		FilterDateVO filterDateVO = getStartAndEndDate(dashboardChartVO);
		processInstanceTask = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
				? processInstanceTaskRepo.getProcessInstanceTaskForAllWorkspace(userVO.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), date, YorosisConstants.YES)
				: processInstanceTaskRepo.getProcessInstanceTaskForAllWorkspaceWithDateFilter(userVO.getUserId(),
						userGroupIdsList, YorosisContext.get().getTenantId(), date, YorosisConstants.YES,
						Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));

		List<TaskNameListVO> taskNamesList = getTaskNamesList(processInstanceTask);
		if (!taskNamesList.isEmpty()) {
			for (TaskNameListVO object : taskNamesList) {

				if (object.getTaskName() != null) {
					Double y = Double.valueOf(object.getGroupCount());
					pieChartVO.add(PieChartVO.builder().name(object.getTaskName()).y(y).build());
				} else {
					pieChartVO.add(PieChartVO.builder().build());
				}
			}
		}
		return pieChartVO;
	}

	@Transactional
	public BarChartVO getTeamsTaskByTasknameForBarChart(DashboardChartVO dashboardChartVO) {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = landingPageService.getGroupAsUUID(userVO);
		LocalDateTime date = LocalDateTime.now().plus(2, ChronoUnit.YEARS);

		List<ProcessInstanceTask> processInstanceTask = null;
		FilterDateVO filterDateVO = getStartAndEndDate(dashboardChartVO);
		processInstanceTask = (filterDateVO.getStartDate() == null && filterDateVO.getEndDate() == null)
				? processInstanceTaskRepo.getProcessInstanceTaskForAllWorkspace(userVO.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), date, YorosisConstants.YES)
				: processInstanceTaskRepo.getProcessInstanceTaskForAllWorkspaceWithDateFilter(userVO.getUserId(),
						userGroupIdsList, YorosisContext.get().getTenantId(), date, YorosisConstants.YES,
						Timestamp.valueOf(filterDateVO.getStartDate()), Timestamp.valueOf(filterDateVO.getEndDate()));

		List<TaskNameListVO> taskNamesList = getTaskNamesList(processInstanceTask);
		List<String> xAxisCategoriesList = new ArrayList<>();
		List<PlotPointAndColorVO> dataList = new ArrayList<>();
		if (!taskNamesList.isEmpty()) {
			for (TaskNameListVO object : taskNamesList) {
				dataList.add(PlotPointAndColorVO.builder().y(Long.valueOf(object.getGroupCount())).build());
				xAxisCategoriesList.add(object.getTaskName());
			}
		}
		return BarChartVO.builder().xAxisCategories(xAxisCategoriesList).name("Total Task").data(dataList).build();
	}

	private List<TaskNameListVO> getTaskNamesList(List<ProcessInstanceTask> listOfTasks) {
		Map<String, List<TaskNameListVO>> updatedTaskList = new HashMap<>();
		LocalDateTime date = LocalDateTime.now().plus(2, ChronoUnit.YEARS);
		List<TaskNameListVO> taskNamesList = new ArrayList<>();
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> userGroupIdsList = landingPageService.getGroupAsUUID(userVO);
		for (ProcessInstanceTask task : listOfTasks) {
			if (!updatedTaskList.containsKey(task.getProcessDefinitionTask().getTaskName())) {
				int userCount = processInstanceTaskRepo.getProcessInstanceTaskForUserTaskByTaskname(
						task.getProcessDefinitionTask().getTaskName(), userVO.getUserId(),
						YorosisContext.get().getTenantId(), date, YorosisConstants.YES);
				int groupCount = processInstanceTaskRepo.getProcessInstanceTaskForGroupTaskByTaskname(
						task.getProcessDefinitionTask().getTaskName(), userVO.getUserId(), userGroupIdsList,
						YorosisContext.get().getTenantId(), date, YorosisConstants.YES);

				TaskNameListVO build = TaskNameListVO.builder().taskName(task.getProcessDefinitionTask().getTaskName())
						.groupCount(groupCount).userCount(userCount).build();
				taskNamesList.add(build);
				updatedTaskList.put(task.getProcessDefinitionTask().getTaskName(), taskNamesList);
			}
		}

		return taskNamesList;
	}

	private Map<String, List<WorkflowVO>> getTaskListByUsers(List<WorkflowVO> workflowTasksVo) {
		Map<String, List<WorkflowVO>> updatedTaskList = new HashMap<>();
		List<WorkflowVO> workflowList = new ArrayList<>();
		for (WorkflowVO workflowVO : workflowTasksVo) {
			if (workflowVO.getAssignedTo() != null && StringUtils.isNotBlank(workflowVO.getAssignedTo())) {
				if (!updatedTaskList.containsKey(workflowVO.getAssignedTo())) {
					workflowList.add(workflowVO);
					updatedTaskList.put(workflowVO.getAssignedTo(), workflowList);
				} else {
					List<WorkflowVO> list = updatedTaskList.get(workflowVO.getAssignedTo());
					list.add(workflowVO);
				}
			}
		}

		return updatedTaskList;
	}

	private Map<String, List<WorkflowVO>> getTaskListByTeams(List<WorkflowVO> workflowTasksVo) {
		Map<String, List<WorkflowVO>> updatedTaskList = new HashMap<>();
		List<WorkflowVO> workflowList = new ArrayList<>();
		for (WorkflowVO workflowVO : workflowTasksVo) {
			for (String group : workflowVO.getAssignedToGroup()) {
				if (workflowVO.getAssignedToGroup() != null && !workflowVO.getAssignedToGroup().isEmpty()) {
					if (!updatedTaskList.containsKey(group)) {
						workflowList.add(workflowVO);
						updatedTaskList.put(group, workflowList);
					} else {
						List<WorkflowVO> list = updatedTaskList.get(group);
						list.add(workflowVO);
					}
				}
			}
		}

		return updatedTaskList;
	}

	@Transactional
	public ResponseStringVO deleteDashboard(UUID id) {
		Dashboard dashboard = dashboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(id,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);

		if (dashboard != null) {
			dashboard.setActiveFlag(YorosisConstants.NO);
			dashboardRepository.save(dashboard);

			List<DashboardWidgets> dashboardWidgets = dashboardWidgetRepository.getDashboardWidgetsByDashboardId(id,
					YorosisContext.get().getTenantId(), YorosisConstants.YES);

			if (!dashboardWidgets.isEmpty()) {
				dashboardWidgetRepository.deleteAll(dashboardWidgets);
			}
			return ResponseStringVO.builder().response("Dashboard removed successfully").build();
		}
		return ResponseStringVO.builder().response("Invalid Data").build();
	}

}
