import { Injectable } from '@angular/core';
import { TaskNode } from '../model/task-node';
import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { WorkFlowList } from '../../../designer-module/shared/vo/workflow-list-vo';

import { TableObjectsVO } from '../../../creation-module/table-objects/table-object-vo';
import { Permission } from '../../../rendering-module/yoro-security/security-vo';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';


@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http: HttpClient, private workspaceService: WorkspaceService) { }

  private createWorkFlowUrl = environment.baseurl + '/flow/v1/create/workflow/';
  private updateWorkflowUrl = environment.baseurl + '/flow/v1/update/workflow/';
  private getWorkFlowStructureUrl = environment.baseurl + '/flow/v1/get/workflow/';
  private checkWorkflowByNameUrl = environment.baseurl + '/flow/v1/check/name/';
  private checkWorkflowByKeyUrl = environment.baseurl + '/flow/v1/check/key/';
  private publishWorkFlowUrl = environment.baseurl + '/flow/v1/publish/workflow/';
  private listWorkflowUrl = environment.baseurl + '/flow/v1/get/list/';
  private getPageListUrl = environment.renderingBaseUrl + '/page/v1/get/list';
  private getPageNameUrl = environment.creationBaseUrl + '/page/v1/get/pageNames/';
  private savePagesUrl = environment.creationBaseUrl + '/page/v1/save/import/pages/';
  private getWorkflowListUrl = environment.baseurl + '/flow/v1/get/workflow/list/';
  getTableListVOUrl = environment.creationBaseUrl + '/table/v1/get-table-vo-list';
  saveTableListUrl = environment.creationBaseUrl + '/table/v1/save/table-list';
  getPagePermissionsUrl = environment.creationBaseUrl + '/page-security/v1/get/permission';
  savePagePermissionUrl = environment.creationBaseUrl + '/page-security/v1/save/permission';
  savePagePermissionorImportUrl = environment.creationBaseUrl + '/page-security/v1/save/permission/import';
  getTableNameUrl = environment.creationBaseUrl + '/table/v1/get/table-names'

  public getToolKit(): Observable<TaskNode[]> {
    return new Observable((observer) => {
      observer.next([{
        key: '',
        taskType: 'START_TASK',
        label: 'START'
      },
      {
        key: '',
        taskType: 'END_TASK',
        label: 'START'
      },
      {
        key: '',
        taskType: 'USER_TASK',
        label: 'START'
      },
      {
        key: 'approval_task1',
        taskType: 'APPROVAL_TASK',
        label: 'Approval form'
      },
      {
        key: '',
        taskType: 'DECISION_TASK',
        label: 'START'
      },
      {
        key: '',
        taskType: 'DECISION_TABLE',
        label: 'decision table'
      },
      {
        key: '',
        taskType: 'WEB_SERVICE_TASK',
        label: 'Web service task'
      },
      {
        key: '',
        taskType: 'EMAIL_TASK',
        label: 'START'
      },
      {
        key: '',
        taskType: 'DELAY_TIMER',
        label: 'START'
      },
      {
        key: '',
        taskType: 'DB_TASK',
        label: 'START'
      },
      {
        key: '',
        taskType: 'CALL_ANOTHER_WORKFLOW',
        label: 'call another workflow'
      },
      {
        key: '',
        taskType: 'COMPUTE_TASK',
        label: 'compute form'
      },
      {
        key: '',
        taskType: 'SMS_TASK',
        label: 'SMS task'
      },
      {
        key: '',
        taskType: 'COUNTER_TASK',
        label: 'counter task'
      },
      {
        key: '',
        taskType: 'EXCEL_REPORT',
        label: 'excel report'
      },
      ]
      );
    });
  }


  getWorkFlowList() {
    return this.http.get<WorkFlowList[]>(this.listWorkflowUrl + this.workspaceService.workspaceID);
  }

  createWorkFlow(workflow) {
    return this.http.post<any>(this.createWorkFlowUrl + this.workspaceService.workspaceID, workflow);
  }

  updateWorkflow(workflow) {
    return this.http.post<any>(this.updateWorkflowUrl + this.workspaceService.workspaceID, workflow);
  }

  getWorkFlowStructure(version, processId) {
    return this.http.get<any>(this.getWorkFlowStructureUrl + version + '/' + processId + '/' + this.workspaceService.workspaceID);
  }

  checkWorkflowByName(workflowName) {
    return this.http.get<any>(this.checkWorkflowByNameUrl + workflowName);
  }

  checkWorkflowByKey(workflowKey) {
    return this.http.get<any>(this.checkWorkflowByKeyUrl + workflowKey);
  }

  publishWorkFlow(workflowKey, workflowVersion) {
    return this.http.get<any>(this.publishWorkFlowUrl + workflowVersion + '/' + workflowKey + '/' + this.workspaceService.workspaceID);
  }

  getWorkflowList() {
    return this.http.get<any>(this.getWorkflowListUrl + this.workspaceService.workspaceID);
  }

  getPageList(exportPages) {
    return this.http.post<any>(this.getPageListUrl, exportPages);
  }

  getPageNameList() {
    return this.http.get<any>(this.getPageNameUrl + this.workspaceService.workspaceID);
  }

  savePages(pageVO) {
    return this.http.post<any>(this.savePagesUrl + this.workspaceService.workspaceID, pageVO);
  }

  getTableListVO(tableListVO) {
    return this.http.post<any>(this.getTableListVOUrl, tableListVO);
  }

  saveTableListVO(tableList: TableObjectsVO[]) {
    return this.http.post<any>(this.saveTableListUrl, tableList);
  }

  getPagePermissions(data) {
    return this.http.post<any>(this.getPagePermissionsUrl, data);
  }

  savePagePaermissions(permissionVO: Permission[]) {
    return this.http.post<any>(this.savePagePermissionUrl, permissionVO);
  }

  savePagePaermissionsForImport(permissionVO: Permission[]) {
    return this.http.post<any>(this.savePagePermissionorImportUrl, permissionVO);
  }

  getTableNames() {
    return this.http.get<any>(this.getTableNameUrl);
  }
}


