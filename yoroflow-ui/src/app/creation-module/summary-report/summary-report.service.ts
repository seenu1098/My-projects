import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginationVO } from 'src/app/shared-module/yorogrid/pagination-vo';
import { WorkspaceListVO } from 'src/app/workspace-module/create-dialog/create-dialog-vo';
import { environment } from 'src/environments/environment';
import { OrgSummaryReportVo, TaskBoardTaskSummaryVo, WorkflowSummaryVO } from './summary-report-model';

@Injectable({
  providedIn: 'root'
})
export class SummaryReportService {

  public iconsColorArray: string[] = ['#5445ff', '#bd33a4', '#f39c12', '#28a745', '#5aaccf'];
  private listAllWorkspaceURL = environment.creationBaseUrl + '/workspace/v1/get/all/workspace-list/';
  private getUsersListUrl = environment.baseurl + '/user-service/v1/get/users';
  private groupURl = environment.renderingBaseUrl + '/group/v1';
  private taskboardSummaryUrl = environment.baseurl + '/workspace/v1/all/taskboard-name-list/';
  private workflowSummaryUrl = environment.baseurl + '/workspace/v1/all/workflow-name-list/';
  private orgSummaryDetailsUrl = environment.creationBaseUrl + '/workspace/v1/get/org/summary/';

  constructor(private http: HttpClient) { }

  public listAllWorkspaceList(subdomainName: string): Observable<WorkspaceListVO[]> {
    return this.http.get<WorkspaceListVO[]>(this.listAllWorkspaceURL + subdomainName);
  }

  public getOwnerList(): Observable<any> {
    return this.http.get<any>(this.getUsersListUrl);
  }

  public getGroupList(): Observable<any> {
    return this.http.get<any[]>(this.groupURl + '/get/groups');
  }

  public getTaskboardSummary(pagination: PaginationVO, workspaceId: string, subdomainName: string): Observable<TaskBoardTaskSummaryVo[]> {
    return this.http.post<TaskBoardTaskSummaryVo[]>(this.taskboardSummaryUrl + workspaceId + '/' + subdomainName, pagination);
  }

  public getWorkflowSummary(pagination: PaginationVO, workspaceId: string, subdomainName: string): Observable<WorkflowSummaryVO[]> {
    return this.http.post<WorkflowSummaryVO[]>(this.workflowSummaryUrl + workspaceId + '/' + subdomainName, pagination);
  }

  public getOrgSummaryDetails(subdomainName: string): Observable<OrgSummaryReportVo> {
    return this.http.get<OrgSummaryReportVo>(this.orgSummaryDetailsUrl + subdomainName);
  }
}
