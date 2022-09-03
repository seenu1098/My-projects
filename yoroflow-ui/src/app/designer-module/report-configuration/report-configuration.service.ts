import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { environment } from '../../../environments/environment';
import { PaginationVO, ReportGenerationVo, WorkFlowList, WorkflowReportVo } from './report-config-vo';

@Injectable({
  providedIn: 'root'
})
export class ReportConfigurationService {

  constructor(private http: HttpClient,private workspaceService:WorkspaceService) { }

  private listWorkflowVersionUrl = environment.workflowBaseurl + '/flow/v1/get/workflow-version/';
  private listWorkflowUrl = environment.workflowBaseurl + '/flow/v1/get/list/';
  private listWorkflowTasknameUrl = environment.workflowBaseurl + '/workflow-report/v1/get/workflow-taskName/';
  private listWorkflowFieldNameTasknameUrl = environment.workflowBaseurl + '/workflow-report/v1/get/field-name/';
  private saveReportUrl = environment.workflowBaseurl + '/workflow-report/v1/save';
  private getReportUrl = environment.workflowBaseurl + '/workflow-report/v1/get/';
  private getGeneratedReportUrl = environment.workflowBaseurl + '/workflow-report/v1/get-report';
  private getGeneratedExcelReportUrl = environment.workflowBaseurl + '/workflow-report/v1/get-excel';
  getDefaultPageSizeUrl = environment.creationBaseUrl + '/org-prefrences/v1/get/org/page-size';

  
  
  saveReport(reportVo) {
    return this.http.post<any>(this.saveReportUrl, reportVo);
  }

  getReportList(id) {
    return this.http.get<WorkflowReportVo>(this.getReportUrl + id);
  }

  getWorkflowVersionList(key) {
    return this.http.get<WorkFlowList[]>(this.listWorkflowVersionUrl + key);
  }

  getWorkFlowList() {
    return this.http.get<WorkFlowList[]>(this.listWorkflowUrl+this.workspaceService.workspaceID);
  }

  getWorkFlowTaskName(key, version) {
    return this.http.get<any[]>(this.listWorkflowTasknameUrl + key + '/' + version);
  }

  getFieldValuesForTaskName(taskId) {
    return this.http.get<any[]>(this.listWorkflowFieldNameTasknameUrl + taskId);
  }

  getGeneratedReport(paginationVO: PaginationVO) {
    return this.http.post<any>(this.getGeneratedReportUrl, paginationVO);
  }

  getExcelData(paginationVO) {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        observe: 'response' as 'response'
      })
    };
    return this.http.post<any>(this.getGeneratedExcelReportUrl, paginationVO, httpOptions);
  }

  getExcelFullData(reportId) {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        observe: 'response' as 'response'
      })
    };
    return this.http.get<any>(this.getGeneratedExcelReportUrl + '/' + reportId, httpOptions);
  }
}
