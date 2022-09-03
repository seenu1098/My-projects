import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnablePin, WorkFlowList } from './workflow-list-vo';
import { environment } from '../../../environments/environment';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class WorkflowDashboardService {

  constructor(private http: HttpClient, private workspaceService: WorkspaceService) { }
  private listWorkflowUrl = environment.baseurl + '/flow/v1/get/list/';
  private workflowListUrl = environment.baseurl + '/flow/v1/get-launch/list/';
  private launchWorkFlowUrl = environment.baseurl + '/flow/v1/start/workflow/';
  private webHookUrl = environment.baseurl + '/flow/v1/get/webhook/workflow/';
  private publishWorkFlowUrl = environment.baseurl + '/flow/v1/publish/workflow/';
  private workflowListCount = environment.baseurl + '/process-instance/v1/get/workflow-dashboard/';
  private formIdentifierUrl = environment.baseurl + '/flow/v1/get/form/workflow/';
  private listCountWorkflowUrl = environment.baseurl + '/flow/v1/get/workflow-applications/count/';
  private saveEnablePinUrl = environment.baseurl + '/flow/v1/save/pin';
  private draftWorkflow = environment.baseurl + '/flow/v1/get/draft-task';
  private isAllowedUrl = environment.baseurl + '/flow/v1/license/is-allowed';
  private getWorkflowDashboardsWithoutWorkspaceUrl = environment.baseurl + '/flow/v1/get/workflow-dashboard/list';

  getWorkFlowList(propertyType: string): Observable<any> {
    return this.http.get<any>(this.listWorkflowUrl + propertyType + '/' + this.workspaceService.workspaceID);
  }

  getWorkspaceWorkFlowList(propertyType: string, isWorkspace: string): Observable<any> {
    return this.http.get<any>(this.workflowListUrl + propertyType + '/' + isWorkspace);
  }

  workflowDraft(processDefinitionId) {
    return this.http.get<any>(this.draftWorkflow + '/' + processDefinitionId);

  }

  getListCount() {
    return this.http.get<any>(this.listCountWorkflowUrl + this.workspaceService.workspaceID);
  }

  getWebhookForLaunchWorkflow(workflowKey, workflowVersion, workspaceId) {
    return this.http.get<any>(this.webHookUrl + workflowKey + '/' + workflowVersion + '/' + 
    (workspaceId === null ? this.workspaceService.workspaceID : workspaceId));
  }

  launchWorkflow(workflowKey, workflowVersion, webHook, workspaceId) {
    if (webHook !== null) {
      return this.http.post<any>(this.launchWorkFlowUrl + workflowKey + '/' + workflowVersion + '/' + 
      (workspaceId === null ? this.workspaceService.workspaceID : workspaceId),
        webHook);
    } else {
      return this.http.post<any>(this.launchWorkFlowUrl + workflowKey + '/' + workflowVersion + '/' + 
      (workspaceId === null ? this.workspaceService.workspaceID : workspaceId),
        { A: 10, B: 20 });
    }
  }

  publishWorkFlow(workflowKey, workflowVersion) {
    return this.http.get<any>(this.publishWorkFlowUrl + workflowVersion + '/' + workflowKey + '/' + this.workspaceService.workspaceID);
  }

  getWorkflowListCount() {
    return this.http.get<any>(this.workflowListCount + this.workspaceService.workspaceID);
  }

  getFormIdentifierLaunchWorkflow(workflowKey, workflowVersion, workspaceId) {
    return this.http.get<any>(this.formIdentifierUrl + workflowKey + '/' + workflowVersion + '/' +
     (workspaceId === null ? this.workspaceService.workspaceID : workspaceId));
  }

  saveEnablePIn(enablePin: EnablePin) {
    return this.http.post<any>(this.saveEnablePinUrl, enablePin);
  }

  isAllowed(licenseVO) {
    return this.http.post<any>(this.isAllowedUrl, licenseVO);
  }

  getWorkflowDashboardsWithoutWorkspace() {
    return this.http.get<any>(this.getWorkflowDashboardsWithoutWorkspaceUrl);
  }
}
