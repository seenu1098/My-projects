import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginationVO } from 'src/app/mytasks-module/mytasks/pagination-vo';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { environment } from 'src/environments/environment';
import { DashboardChartVO, TaskboardVO } from '../landing-page/landing-page-vo';
import { WorkspaceDashboardVO } from '../landing-page/dashboard-vo';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceDashboardService {
  private getTaskboardUrl = environment.baseurl + '/landing-page/v1/get-taskboard-task/';

  private getWorkloadURL = environment.baseurl + '/app-widget/v1/get/workload-by-status';

  private getAssigneeTasksURL = environment.baseurl + '/app-widget/v1/get/task-by-assignee';

  private getAllDoneTaskboardTaskUrl = environment.baseurl + '/app-widget/v1/get-all-done-task-list';

  private getAllUnassignedTaskboardTaskUrl = environment.baseurl + '/app-widget/v1/get-all-unassigned-task-list';


  private getAllProgressTaskboardTaskUrl = environment.baseurl + '/app-widget/v1/get-all-progress-task-list';

  private getAllDeletedTaskboardTaskUrl = environment.baseurl + '/app-widget/v1/get-all-deleted-task-list';

  private getPortfolioUrl = environment.baseurl + '/app-widget/v1/get-portfolio-list';

  private saveDashboardUrl = environment.baseurl + '/app-widget/v1/save-dashboard';

  private getDashboardListUrl = environment.baseurl + '/app-widget/v1/get-dashboard-list';

  private getDashboardUrl = environment.baseurl + '/app-widget/v1/get-dashboard';

  private getDashboardNameListUrl = environment.baseurl + '/app-widget/v1/get-dashboard-name-list';

  private swapWidgetUrl = environment.baseurl + '/app-widget/v1/swap-widget/';

  private saveDashboardNameUrl = environment.baseurl + '/app-widget/v1/save';

  private getTaskboardNameListUrl = environment.baseurl + '/app-widget/v1/get-taskboard-name-widget';


  private deleteWidgetUrl = environment.baseurl + '/app-widget/v1/delete-widget';

  private getTaskListUrl = environment.baseurl + '/app-widget/v1/get-all-task-list';

  private checkDashboardNameUrl = environment.baseurl + '/app-widget/v1/check-dashboard-name';

  private getWorkloadByStatusHorBarUrl = environment.baseurl + '/app-widget/v1/get/hor-bar/workload-by-status';

  private getTaskByAssigneeVerBarUrl = environment.baseurl + '/app-widget/v1/get/ver-bar/task-by-assignee';

  private getAllAssignedTaskCountUrl = environment.baseurl + '/app-widget/v1/get-assigned-task-count';

  private getPriorityPieChartUrl = environment.baseurl + '/app-widget/v1/get/priority-pie-chart';

  private getPriorityBarChartUrl = environment.baseurl + '/app-widget/v1/get/priority-bar-chart';

  private getPriorityTaskCountUrl = environment.baseurl + '/app-widget/v1/get/priority-count';

  private getNoPriorityCountUrl = environment.baseurl + '/app-widget/v1/get/no-priority-count';

  private getTimeTrackingUrl = environment.baseurl + '/app-widget/v1/get/time-tracking';

  private getWorkflowTaskListUrl = environment.baseurl + '/app-widget/v1/get-all-workflow-task-list';

  private getAssigneeTaskByTasknameUrl = environment.baseurl + '/app-widget/v1/get/assignee-task-by-taskname';

  private getTeamsTaskByTasknameUrl = environment.baseurl + '/app-widget/v1/get/teams-task-by-taskname';

  private getProcessInstanceListUrl = environment.baseurl + '/app-widget/v1/get-process-instance-list';

  private getWorkflowTaskByUsersUrl = environment.baseurl + '/app-widget/v1/get/workflow-task-by-users';

  private getWorkflowTaskByTeamsUrl = environment.baseurl + '/app-widget/v1/get/workflow-task-by-teams';

  private getBarAssigneeTaskByTasknameUrl = environment.baseurl + '/app-widget/v1/get/bar/assignee-task-by-taskname';

  private getBarTeamsTaskByTasknameUrl = environment.baseurl + '/app-widget/v1/get/bar/teams-task-by-taskname';

  private getWorkflowTimeTrackingUrl = environment.baseurl + '/app-widget/v1/get/workflow-time-tracking';

  private getBarWorkflowTaskByUsersUrl = environment.baseurl + '/app-widget/v1/get/bar/workflow-task-by-users';

  private getBarWorkflowTaskByTeamsUrl = environment.baseurl + '/app-widget/v1/get/bar/workflow-task-by-teams';

  private getProcessInstanceListCountUrl = environment.baseurl + '/app-widget/v1/get/process-instance-list-count';

  private deleteDashboardUrl = environment.baseurl + '/app-widget/v1/delete-dashboard/';

  private getActiveTaskboardNameListUrl = environment.baseurl + '/app-widget/v1/active-taskboard-name-list';


  constructor(private http: HttpClient, private workspaceService: WorkspaceService) { }

  getTaskboardTableData(paginationVO: PaginationVO) {
    return this.http.post<TaskboardVO>(this.getTaskboardUrl + this.workspaceService.workspaceID, paginationVO);
  }

  getWorkLoadChart(dashboardChartVO: DashboardChartVO) {
    return this.http.post<any>(this.getWorkloadURL, dashboardChartVO);
  }

  getWorkloadByStatusHorBar(dashboardChartVO: DashboardChartVO) {
    return this.http.post<any>(this.getWorkloadByStatusHorBarUrl, dashboardChartVO);
  }

  getTasksByAssigneeChart(dashboardChartVO: DashboardChartVO) {
    return this.http.post<any>(this.getAssigneeTasksURL, dashboardChartVO);
  }

  getAllDoneTaskoardTask(paginationVO: PaginationVO) {
    return this.http.post<any>(this.getAllDoneTaskboardTaskUrl, paginationVO);
  }

  getAllDeletedTaskoardTask(paginationVO: PaginationVO) {
    return this.http.post<any>(this.getAllDeletedTaskboardTaskUrl, paginationVO);
  }

  getAllProgressTaskoardTask(paginationVO: PaginationVO) {
    return this.http.post<any>(this.getAllProgressTaskboardTaskUrl, paginationVO);
  }

  getAllUnassignedTaskoardTask(paginationVO: PaginationVO) {
    return this.http.post<any>(this.getAllUnassignedTaskboardTaskUrl, paginationVO);
  }

  getPortfolio(paginationVO: PaginationVO) {
    return this.http.post<any>(this.getPortfolioUrl, paginationVO);
  }

  saveDashboard(dashboardVo) {
    return this.http.post<any>(this.saveDashboardUrl, dashboardVo);
  }

  getDashboardList() {
    return this.http.get<any>(this.getDashboardListUrl);
  }

  getDashboard(id) {
    return this.http.get<any>(this.getDashboardUrl + '/' + id);
  }

  getDashboardNameList() {
    return this.http.get<any>(this.getDashboardNameListUrl);
  }

  swapWidget(id, workspaceSwapVO) {
    return this.http.post<any>(this.swapWidgetUrl + id, workspaceSwapVO);
  }

  saveDashboardName(dashboardVO: WorkspaceDashboardVO) {
    return this.http.post<any>(this.saveDashboardNameUrl, dashboardVO);
  }

  getTaskboardNamesList() {
    return this.http.get<any>(this.getTaskboardNameListUrl);
  }

  deleteDashboardWidget(widgetVo) {
    return this.http.post<any>(this.deleteWidgetUrl, widgetVo);
  }

  getAllTaskList(paginationVO: PaginationVO) {
    return this.http.post<any>(this.getTaskListUrl, paginationVO);
  }

  checkDashboardName(dashboardName) {
    return this.http.get<any>(this.checkDashboardNameUrl + '/' + dashboardName);
  }

  getTaskByAssigneeVerBar(dashboardChartVO: DashboardChartVO) {
    return this.http.post<any>(this.getTaskByAssigneeVerBarUrl, dashboardChartVO);
  }

  getAssignedTaskCount(paginationVO) {
    return this.http.post<any>(this.getAllAssignedTaskCountUrl, paginationVO);
  }

  getPriorityPieChart(dashboardChartVO: DashboardChartVO) {
    return this.http.post<any>(this.getPriorityPieChartUrl, dashboardChartVO);
  }

  getPriorityBarChart(dashboardChartVO: DashboardChartVO) {
    return this.http.post<any>(this.getPriorityBarChartUrl, dashboardChartVO);
  }

  getPriorityTaskCount(dashboardChartVO: DashboardChartVO) {
    return this.http.post<any>(this.getPriorityTaskCountUrl, dashboardChartVO);
  }

  getNoPriorityTaskCount(dashboardChartVO: DashboardChartVO) {
    return this.http.post<any>(this.getNoPriorityCountUrl, dashboardChartVO);
  }

  getTimeTracking(paginationVO: PaginationVO) {
    return this.http.post<any>(this.getTimeTrackingUrl, paginationVO);
  }

  getWorkflowTaskList(paginationVO) {
    return this.http.post<any>(this.getWorkflowTaskListUrl, paginationVO);
  }

  getAssigneeTaskByTaskname(dashboardChartVO: DashboardChartVO) {
    return this.http.post<any>(this.getAssigneeTaskByTasknameUrl, dashboardChartVO);
  }

  getTeamsTaskByTaskname(dashboardChartVO: DashboardChartVO) {
    return this.http.post<any>(this.getTeamsTaskByTasknameUrl, dashboardChartVO);
  }

  getProcessInstanceList(paginationVO) {
    return this.http.post<any>(this.getProcessInstanceListUrl, paginationVO);
  }

  getWorkflowTaskByUsers(dashboardChartVO: DashboardChartVO) {
    return this.http.post<any>(this.getWorkflowTaskByUsersUrl, dashboardChartVO);
  }

  getWorkflowTaskByTeams(dashboardChartVO: DashboardChartVO) {
    return this.http.post<any>(this.getWorkflowTaskByTeamsUrl, dashboardChartVO);
  }

  getBarAssigneeTaskByTaskname(dashboardChartVO: DashboardChartVO) {
    return this.http.post<any>(this.getBarAssigneeTaskByTasknameUrl, dashboardChartVO);
  }

  getBarTeamsTaskByTaskname(dashboardChartVO: DashboardChartVO) {
    return this.http.post<any>(this.getBarTeamsTaskByTasknameUrl, dashboardChartVO);
  }

  getWorkflowTimeTracking(paginationVO) {
    return this.http.post<any>(this.getWorkflowTimeTrackingUrl, paginationVO);
  }

  getProcessInstanceListCount(paginationVO) {
    return this.http.post<any>(this.getProcessInstanceListCountUrl, paginationVO);
  }

  getBarWorkflowTaskByUsers(dashboardChartVO: DashboardChartVO) {
    return this.http.post<any>(this.getBarWorkflowTaskByUsersUrl, dashboardChartVO);
  }

  getBarWorkflowTaskByTeams(dashboardChartVO: DashboardChartVO) {
    return this.http.post<any>(this.getBarWorkflowTaskByTeamsUrl, dashboardChartVO);
  }

  deleteDashboard(id) {
    return this.http.get<any>(this.deleteDashboardUrl + id);
  }

  getActiveTaskboardNameList() {
    return this.http.get<any>(this.getActiveTaskboardNameListUrl);
  }
}
