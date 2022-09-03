package com.yorosis.yoroflow.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.yoroflow.models.AllTaskVO;
import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.TableData;
import com.yorosis.yoroflow.models.appwidgets.BarChartVO;
import com.yorosis.yoroflow.models.appwidgets.DashboardChartVO;
import com.yorosis.yoroflow.models.appwidgets.DashboardSwapVo;
import com.yorosis.yoroflow.models.appwidgets.DashboardVO;
import com.yorosis.yoroflow.models.appwidgets.DashboardWidgetVO;
import com.yorosis.yoroflow.models.appwidgets.PieChartVO;
import com.yorosis.yoroflow.models.appwidgets.PortfolioTableDataVO;
import com.yorosis.yoroflow.models.landingpage.BoardNameVo;
import com.yorosis.yoroflow.models.landingpage.TaskboardTaskVo;
import com.yorosis.yoroflow.services.AppWidgetService;

@RestController
@RequestMapping("/app-widget/v1/")
public class AppWidgetController {

	@Autowired
	private AppWidgetService appWidgetService;

	@PostMapping("/get/workload-by-status")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public List<PieChartVO> getWorkloadByStatus(@RequestBody DashboardChartVO dashboardChartVO) {
		return appWidgetService.getWorkloadByStatus(dashboardChartVO);
	}

	@PostMapping("/get/hor-bar/workload-by-status")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public BarChartVO getWorkloadByStatusForHorBarChart(@RequestBody DashboardChartVO dashboardChartVO) {
		return appWidgetService.getWorkloadByStatusForHorBarChart(dashboardChartVO);
	}

	@PostMapping("/get/task-by-assignee")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public List<PieChartVO> getTaskByAssignee(@RequestBody DashboardChartVO dashboardChartVO) {
		return appWidgetService.getTaskByAssignee(dashboardChartVO);
	}

	@PostMapping("/get/ver-bar/task-by-assignee")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public BarChartVO getTaskByAssigneeVerBar(@RequestBody DashboardChartVO dashboardChartVO) {
		return appWidgetService.getTaskByAssigneeForBarChart(dashboardChartVO);
	}

	@PostMapping("/get-all-done-task-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public TaskboardTaskVo getAllDoneTaskByWorksoaceId(@RequestBody PaginationVO vo) {
		return appWidgetService.getAllDoneTaskboardTaskByWorkspaceId(vo);
	}

	@PostMapping("/get-all-progress-task-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public TaskboardTaskVo getAllInProgressTaskByWorksoaceId(@RequestBody PaginationVO vo) {
		return appWidgetService.getAllInProgressTaskboardTaskByWorkspaceId(vo);
	}

	@PostMapping("/get-all-deleted-task-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public TaskboardTaskVo getAllDeletedTaskByWorksoaceId(@RequestBody PaginationVO vo) {
		return appWidgetService.getAllDeletedTaskboardTaskByWorkspaceId(vo);
	}

	@PostMapping("/get-all-unassigned-task-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public TaskboardTaskVo getAllUnassinedTaskByWorksoaceId(@RequestBody PaginationVO vo) {
		return appWidgetService.getAllUnassignedTaskboardTaskByWorkspaceId(vo);
	}

	@PostMapping("/get-portfolio-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public PortfolioTableDataVO getPortfolioList(@RequestBody PaginationVO vo) {
		return appWidgetService.getPortfolioByWorkspaceId(vo);
	}

	@PostMapping("/save-dashboard")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public ResponseStringVO saveDashboard(@RequestBody DashboardVO dashboardVO) {
		return appWidgetService.saveDashboard(dashboardVO);
	}

	@PostMapping("/save")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public ResponseStringVO saveDashboardWithoutWidget(@RequestBody DashboardVO dashboardVO) {
		return appWidgetService.saveDashboardWithoutWidget(dashboardVO);
	}

	@PostMapping("/swap-widget/{dashboardId}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public ResponseStringVO swapWidget(@RequestBody List<DashboardSwapVo> dashboardSwapVoList,
			@PathVariable(name = "dashboardId") String dashboardId) {
		return appWidgetService.saveSwapWidgets(dashboardSwapVoList, UUID.fromString(dashboardId));
	}

	@GetMapping("/get-dashboard-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public List<DashboardVO> getDashboardList() {
		return appWidgetService.getDashboardList();
	}

	@GetMapping("/get-dashboard/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public DashboardVO getDashboardList(@PathVariable(name = "id") String id) {
		return appWidgetService.getDashboard(UUID.fromString(id));
	}

	@GetMapping("/get-dashboard-name-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public List<DashboardVO> getDashboardNameList() {
		return appWidgetService.getDashboardNameList();
	}

	@GetMapping("/get-taskboard-name-widget")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public List<BoardNameVo> getBoardNameList() {
		return appWidgetService.getTaskboardNames();
	}

	@PostMapping("/delete-widget")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public ResponseStringVO deleteWidget(@RequestBody DashboardWidgetVO dashboardWidgetVO) {
		return appWidgetService.deleteWidget(dashboardWidgetVO);
	}

	@PostMapping("/get-all-task-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public TaskboardTaskVo getAllTasklist(@RequestBody PaginationVO vo) {
		return appWidgetService.getTaskList(vo);
	}

	@GetMapping("/check-dashboard-name/{dashboardName}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public ResponseStringVO checkDashboardName(@PathVariable(name = "dashboardName") String dashboardName) {
		return appWidgetService.checkDashboardName(dashboardName);
	}

	@PostMapping("/get-assigned-task-count")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public TaskboardTaskVo getAllAssignedTaskCount(@RequestBody PaginationVO vo) {
		return appWidgetService.getAllAssignedTaskCountForAllWorkspace(vo);
	}

	@PostMapping("/get/priority-pie-chart")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public List<PieChartVO> getTasksByPriorityForPieChart(@RequestBody DashboardChartVO dashboardChartVO) {
		return appWidgetService.getTasksByPriorityForPieChart(dashboardChartVO);
	}

	@PostMapping("/get/priority-bar-chart")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public BarChartVO getTasksByPriorityForBarChart(@RequestBody DashboardChartVO dashboardChartVO) {
		return appWidgetService.getTasksByPriorityForBarChart(dashboardChartVO);
	}

	@PostMapping("/get/priority-count")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public TaskboardTaskVo getPriorityCount(@RequestBody DashboardChartVO dashboardChartVO) {
		return appWidgetService.getPriorityTaskCount(dashboardChartVO);
	}

	@PostMapping("/get/no-priority-count")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public TaskboardTaskVo getNoPriorityCount(@RequestBody DashboardChartVO dashboardChartVO) {
		return appWidgetService.getNoPriorityTaskCount(dashboardChartVO);
	}

	@PostMapping("/get/time-tracking")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public TaskboardTaskVo getTimeTracking(@RequestBody PaginationVO vo) {
		return appWidgetService.getTimeTracking(vo);
	}

	@PostMapping("/get-all-workflow-task-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public AllTaskVO getAllWorkflowTaskList(@RequestBody PaginationVO vo) {
		return appWidgetService.getWorkflowTasksList(vo);
	}

	@PostMapping("/get/assignee-task-by-taskname")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public List<PieChartVO> getAssigneeTaskByTaskname(@RequestBody DashboardChartVO dashboardChartVO) {
		return appWidgetService.getAssigneeTaskByTaskname(dashboardChartVO);
	}

	@PostMapping("/get/teams-task-by-taskname")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public List<PieChartVO> getTeamsTaskByTaskname(@RequestBody DashboardChartVO dashboardChartVO) {
		return appWidgetService.getTeamsTaskByTaskname(dashboardChartVO);
	}

	@PostMapping("/get-process-instance-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public TableData getProcessInstanceList(@RequestBody PaginationVO vo) {
		return appWidgetService.getProcessInstanceList(vo);
	}

	@PostMapping("/get/workflow-task-by-users")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public List<PieChartVO> getWorkflowTasksByUsers(@RequestBody DashboardChartVO dashboardChartVO) {
		return appWidgetService.getWorkflowTasksByUsers(dashboardChartVO);
	}

	@PostMapping("/get/workflow-task-by-teams")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public List<PieChartVO> getWorkflowTasksByTeams(@RequestBody DashboardChartVO dashboardChartVO) {
		return appWidgetService.getWorkflowTasksByTeams(dashboardChartVO);
	}

	@PostMapping("/get/bar/assignee-task-by-taskname")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public BarChartVO getAssigneeTaskByTasknameForBarChart(@RequestBody DashboardChartVO dashboardChartVO) {
		return appWidgetService.getAssigneeTaskByTasknameForBarChart(dashboardChartVO);
	}

	@PostMapping("/get/bar/teams-task-by-taskname")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public BarChartVO getTeamsTaskByTasknameForBarChart(@RequestBody DashboardChartVO dashboardChartVO) {
		return appWidgetService.getTeamsTaskByTasknameForBarChart(dashboardChartVO);
	}

	@PostMapping("/get/process-instance-list-count")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public TableData getProcessInstanceListCount(@RequestBody PaginationVO vo) {
		return appWidgetService.getProcessInstanceListCount(vo);
	}

	@PostMapping("/get/workflow-time-tracking")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public AllTaskVO getWorkflowTimeTracking(@RequestBody PaginationVO vo) {
		return appWidgetService.getWorkflowDataForTimeTracking(vo);
	}

	@PostMapping("/get/bar/workflow-task-by-users")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public BarChartVO getWorkflowTasksByUsersForBarChart(@RequestBody DashboardChartVO dashboardChartVO) {
		return appWidgetService.getWorkflowTasksByUsersForBarChart(dashboardChartVO);
	}

	@PostMapping("/get/bar/workflow-task-by-teams")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public BarChartVO getWorkflowTasksByTeamsForBarchart(@RequestBody DashboardChartVO dashboardChartVO) {
		return appWidgetService.getWorkflowTasksByTeamsForBarChart(dashboardChartVO);
	}

	@GetMapping("/delete-dashboard/{id}")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest',"
			+ "'Taskboard User','Workflow User'})")
	public ResponseStringVO deleteDashboard(@PathVariable(name = "id") String id) {
		return appWidgetService.deleteDashboard(UUID.fromString(id));
	}

	@GetMapping("/active-taskboard-name-list")
	@PreAuthorize("@yorosisRoleChecker.canAllow({'Account Owner','Account Administrator','User','Guest','Taskboard User'})")
	public List<BoardNameVo> getActiveTaskboardNamesList() {
		return appWidgetService.getActiveTaskboardNames();
	}
}
