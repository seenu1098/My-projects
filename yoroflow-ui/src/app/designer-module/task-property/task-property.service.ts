import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseString } from '../../designer-module/shared/vo/reponse-vo';
import { PageFieldVo, PageFieldVO, SMSKeyWorkflowVO, TimeZoneVo } from './page-field-vo';
import { UserVO } from './model/user-vo';
import { GroupVO } from './model/group-vo';
// import { Page } from 'yoroapps-rendering-lib/lib/shared/vo/page-vo';
import { Page } from '../../rendering-module/shared/vo/page-vo';
import { environment } from '../../../environments/environment';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';


@Injectable({
  providedIn: 'root'
})
export class TaskPropertyService {

  private renderingUrl = environment.renderingBaseUrl;
  private pageIdUrl = environment.creationBaseUrl + '/page/v1/get/workflowform/page-names/';
  private saveTaskPropertyUrl = environment.baseurl + '/task-property/v1/create';
  private getInitialValuesUrl = environment.baseurl + '/flow/v1/get/assign/fields/';
  private getPageFieldsUrl = environment.creationBaseUrl + '/dynamic-page/v1/get/fields/for/page/sub-section/';
  private tableUrl = environment.baseurl + '/flow/v1/get/table-names';
  private tableColumnUrl = environment.baseurl + '/flow/v1/get/field-names/';
  private usersListUrl = environment.baseurl + '/user-service/v1/get/users';
  private groupsListUrl = environment.baseurl + '/user-management/v1/get/list';
  private workflowListUrl = environment.baseurl + '/flow/v1/get/list/';
  private customPageListUrl = this.renderingUrl + '/custom-page/v1/get-list';
  private webServiceFieldsWorkFlowUrl = environment.baseurl + '/flow/v1/get/fields/';
  private pageVersionListUrl = environment.creationBaseUrl + '/page/v1/get/page-version/';
  private getPagePermissionUrl = environment.renderingBaseUrl + '/page-security/v1/get-permission';
  // private getPublicForm = environment.renderingBaseUrl + '/page/v1/public/';
  private getDefaultTimeZoneUrl = environment.baseurl + '/flow/v1/get/default-time-zone';
  private getSMSProviderNamesUrl = environment.baseurl + '/flow/v1/get/sms/providers';

  constructor(private http: HttpClient, private workspaceService: WorkspaceService) { }

  getPageId(type) {
    return this.http.get<any>(this.pageIdUrl + type + '/' + this.workspaceService.workspaceID);
  }

  // getPageVersion(pageId) {
  //   return this.http.get<any>(this.pageVersionListUrl + pageId);
  // }

  getPageVersion(pageId, layoutType) {
    return this.http.get<any>(this.pageVersionListUrl + pageId + '/' + layoutType);
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

  getPageFields(formId, version) {
    return this.http.get<any>(this.getPageFieldsUrl + formId + '/' + version);
  }

  // getPublicPage(formId, version) {
  //   return this.http.get<any>(this.getPublicForm + formId + '/' + version);
  // }

  getWorkflowList() {
    return this.http.get<any[]>(this.workflowListUrl + this.workspaceService.workspaceID);
  }

  getInitialFields(workflowJson, taskKey) {
    return this.http.post<PageFieldVo[]>(this.getInitialValuesUrl + taskKey, workflowJson);
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

  getPagePermission(permission) {
    return this.http.post<ResponseString>(this.getPagePermissionUrl, permission);
  }

  getDefaultTimeZone() {
    return this.http.get<TimeZoneVo>(this.getDefaultTimeZoneUrl);
  }

  getProviderNames() {
    return this.http.get<SMSKeyWorkflowVO[]>(this.getSMSProviderNamesUrl);
  }

}
