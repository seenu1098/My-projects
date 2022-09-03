import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ResponseString } from '../shared/vo/reponse-vo';
import { PageFieldVO } from './page-field-vo';
import { UserVO } from './model/user-vo';
import { GroupVO } from './model/group-vo';
import { environment } from '../../../environments/environment';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Injectable({
  providedIn: 'root'
})
export class TaskPropertyService {

  private renderingUrl = environment.renderingBaseUrl;
  private pageIdUrl = environment.creationBaseUrl + '/page/v1/get/page-names';
  private saveTaskPropertyUrl = environment.baseurl + '/task-property/v1/create';
  private getInitialValuesUrl = environment.baseurl + '/flow/v1/get/assign/fields/';
  private getInitialValuesJsonUrl = environment.baseurl + '/flow/v1/get/assign/fields/';
  private getPageFieldsUrl = this.renderingUrl + '/dynamic-page/v1/get/fields/for/page/';
  private tableUrl = environment.baseurl + '/flow/v1/get/table-names';
  private tableColumnUrl = environment.baseurl + '/flow/v1/get/field-names/';
  private usersListUrl = environment.baseurl + '/user-service/v1/get/users';
  private groupsListUrl = environment.baseurl + '/user-management/v1/get/list';
  private workflowListUrl = environment.baseurl + '/flow/v1/get/list/';
  private customPageListUrl = this.renderingUrl + '/custom-page/v1/get-list';
  private webServiceFieldsWorkFlowUrl = environment.baseurl + '/flow/v1/get/fields/';

  constructor(private http: HttpClient, private workspaceService: WorkspaceService) { }

  getPageId() {
    return this.http.get<any>(this.pageIdUrl);
  }

  loadCustomPage() {
    return this.http.get<any>(this.customPageListUrl);
  }

  getTables() {
    return this.http.get<any>(this.tableUrl);
  }

  getTableColumns(tableId) {
    return this.http.get<any>(this.tableColumnUrl + tableId);
  }

  saveTaskProperty(taskPropertyVO) {
    return this.http.post<ResponseString>(this.saveTaskPropertyUrl, taskPropertyVO);
  }

  getPageFields(formId) {
    return this.http.get<PageFieldVO[]>(this.getPageFieldsUrl + formId);
  }

  getWorkflowList() {
    return this.http.get<any[]>(this.workflowListUrl + this.workspaceService.workspaceID);
  }

  getInitialFields(workflowJson, taskKey) {
    return this.http.post<PageFieldVO[]>(this.getInitialValuesUrl + taskKey, workflowJson);
  }

  getUsersList() {
    return this.http.get<UserVO[]>(this.usersListUrl);
  }

  getGroupsList() {
    return this.http.get<GroupVO[]>(this.groupsListUrl);
  }

  getWebServiceFieldValues(workflowKey, workflowVersion) {
    return this.http.get<any>(this.webServiceFieldsWorkFlowUrl + workflowKey + '/' + workflowVersion + '/'
     + this.workspaceService.workspaceID);
  }

}
