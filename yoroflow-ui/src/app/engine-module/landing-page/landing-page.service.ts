import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  DashboardVO, LatestWorkflowVO, OverviewVO, TaskboardTasksVO, TaskboardVO, WorkflowTasksVO, WorkflowVO, BoardNameVo, CurrentUserVO,
  DashboardChartVO
} from './landing-page-vo';
import { environment } from '../../../environments/environment';
import { PaginationVO } from 'src/app/mytasks-module/mytasks/pagination-vo';
import { TaskboardTaskVO } from 'src/app/taskboard-module/taskboard-form-details/taskboard-task-vo';
import { GroupVO } from "../../designer-module/task-property/model/group-vo";
import { Observable } from 'rxjs';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Injectable({
  providedIn: 'root'
})
export class LandingPageService {

  public workSpaceSwitchEmitter = new EventEmitter();

  getLandingPageURL = environment.baseurl + '/landing-page/v1/get-count/';

  getOverviewURL = environment.baseurl + '/landing-page/v1/get-count/';

  getTaskboardURL = environment.baseurl + '/landing-page/v1/get-taskboard-task/';

  getWorkflowURL = environment.baseurl + '/landing-page/v1/get-workflow-task/';

  getlatestWorkflowURL = environment.baseurl + '/landing-page/v1/get-workflow/';

  getTaskboardTasksURL = environment.baseurl + '/taskboard/v1/get/taskboard-task/';

  getBoardNamesURL = environment.baseurl + '/landing-page/v1/get-taskboard-names/';

  getWorkflowGroupsURL = environment.baseurl + '/landing-page/v1/get-workflow-groups';

  getLoggedUserDetailsUrl = environment.baseurl + '/user-service/v1/get/logged-in/user-details';

  getDoneTaskboardTasksUrl = environment.baseurl + '/landing-page/v1/get-done-taskboard-task';

  getDoneSubStatusListUrl = environment.baseurl + '/landing-page/v1/get-done-sub-status-list';

  getWorkloadURL = environment.baseurl + '/app-widget/v1/get/workload-by-status';

  getAssigneeTasksURL = environment.baseurl + '/app-widget/v1/get/task-by-assignee';

  getAllDoneTaskboardTaskUrl = environment.baseurl + '/app-widget/v1/get-all-done-task-list';

  getAllUnassignedTaskboardTaskUrl = environment.baseurl + '/app-widget/v1/get-all-unassigned-task-list';


  getAllProgressTaskboardTaskUrl = environment.baseurl + '/app-widget/v1/get-all-progress-task-list';

  getAllDeletedTaskboardTaskUrl = environment.baseurl + '/app-widget/v1/get-all-deleted-task-list';

  getPortfolioUrl = environment.baseurl + '/app-widget/v1/get-portfolio-list';

  saveDashboardUrl = environment.baseurl + '/app-widget/v1/save-dashboard';

  constructor(private http: HttpClient, private worksapceService: WorkspaceService) { }

  invokeWorkspaceEmitter(): void {
    this.workSpaceSwitchEmitter.emit(true);
  }

  dashboardCard() {
    return this.http.get<DashboardVO>(this.getLandingPageURL + this.worksapceService.workspaceID);
  }
  overviewCard(filterType) {
    return this.http.get<OverviewVO>(this.getOverviewURL + filterType + '/' + this.worksapceService.workspaceID);
  }
  getTaskboardTableData(paginationVO: PaginationVO) {
    return this.http.post<TaskboardVO>(this.getTaskboardURL + this.worksapceService.workspaceID, paginationVO);
  }
  getWorkflowTableData(paginationVO: PaginationVO) {
    return this.http.post<WorkflowVO>(this.getWorkflowURL + this.worksapceService.workspaceID, paginationVO);
  }
  getLatestWorkflowData() {
    return this.http.get<LatestWorkflowVO[]>(this.getlatestWorkflowURL + this.worksapceService.workspaceID);
  }
  getTaskboardTaskDetails(id) {
    return this.http.get<TaskboardTaskVO>(this.getTaskboardTasksURL + id);
  }
  getBoardNames() {
    return this.http.get<any>(this.getBoardNamesURL + this.worksapceService.workspaceID);
  }
  getWorkflowGroups() {
    return this.http.get<any>(this.getWorkflowGroupsURL);
  }
  getLoggedInUserDetails(): Observable<CurrentUserVO> {
    return this.http.get<CurrentUserVO>(this.getLoggedUserDetailsUrl);
  }

  getDoneTaskoardTask(paginationVO: PaginationVO) {
    return this.http.post<any>(this.getDoneTaskboardTasksUrl, paginationVO);
  }

  getDoneSubStatusList(paginationVO: PaginationVO) {
    return this.http.post<any>(this.getDoneSubStatusListUrl, paginationVO);
  }

  getWorkLoadChart() {
    return this.http.get<any>(this.getWorkloadURL);
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

}
