import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { TokenHeaderService } from '../../../shared-module/services/token-header.service';
import { Select, OptionsValue } from '../vo/page-vo';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskboardTaskVO } from '../../../taskboard-module/taskboard-form-details/taskboard-task-vo';
import { TaskboardVO } from '../../../taskboard-module/taskboard-configuration/taskboard.model';
import { environment } from 'src/environments/environment';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

// import { TaskboardTaskVO } from 'src/app/engine-module/taskboard-form-details/taskboard-task-vo';
// import { TaskboardVO } from 'src/app/taskboard-configuration/taskboard.model';

@Injectable({
  providedIn: 'root'
})
export class DynamicQueryBuilderService {

  constructor(private http: HttpClient, private token: TokenHeaderService, private workspaceService: WorkspaceService) { }


  pageUrl = environment.renderingBaseUrl + '/dynamic-page/v1/save/';
  publicPageUrl = environment.renderingBaseUrl + '/public/save';
  dynamicOptionsUrl = environment.renderingBaseUrl + '/dynamic-page/v1/get/list/values';
  getGridDataUrl = environment.renderingBaseUrl + '/dynamic-page/v1/get/page/';
  getPageDataByFieldNameAndUrl = environment.renderingBaseUrl + '/dynamic-page/v1/get/page/';
  dynamicOptionsByFilterValueUrl = environment.renderingBaseUrl + '/dynamic-page/v1/get/list/filter/value';
  getAssignFieldJsonUrl = environment.workflowBaseurl + '/flow/v1/get/initial-values/';
  dynamicOptionsForAutoCompleteUrl = environment.renderingBaseUrl + '/dynamic-page/v1/get/auto-complete-list';
  savePageAndFilesUrl = environment.renderingBaseUrl + '/dynamic-page/v1/save/page/files/';
  reassignTaskUrl = environment.workflowBaseurl + '/mytask/v1/reassign-task';
  savePageAsDraftUrl = environment.workflowBaseurl + '/flow/v1/save/task-data/draft/';
  deleteUrl = environment.renderingBaseUrl + '/dynamic-page/v1/delete/page/data';

  publicDynamicOptionsUrl = environment.renderingBaseUrl + '/public/get/list/values';
  publicDynamicOptionsByFilterValueUrl = environment.renderingBaseUrl + '/public/get/list/filter/value';
  publicDynamicOptionsForAutoCompleteUrl = environment.renderingBaseUrl + '/public/get/auto-complete-list';

  getTaskboardIdUrl = environment.workflowBaseurl + '/taskboard/v1/get/taskboard-by-key/';
  saveTaskboardTaskUrl = environment.workflowBaseurl + '/taskboard/v1/save/taskboard-task';

  savePageInfoAsDraft(formData, saveAsDraft) {
    return this.http.post(this.savePageAsDraftUrl + saveAsDraft, formData);
  }

  reAssignTask(taskData) {
    return this.http.post(this.reassignTaskUrl, taskData);
  }

  savePageAndFiles(formData) {
    return this.http.post(this.savePageAndFilesUrl + this.workspaceService.workspaceID, formData);
  }
  savePage(jsonObject) {
    return this.http.post(this.pageUrl + this.workspaceService.workspaceID, JSON.stringify(jsonObject), this.token.getHeader());
  }

  savePublicPage(jsonObject) {
    return this.http.post<any>(this.publicPageUrl, JSON.stringify(jsonObject));
  }

  saveSignupPublicPage(json) {
    return this.http.post<any>(this.publicPageUrl, json);
  }

  getOptionValues(select: Select) {
    return this.http.post(this.dynamicOptionsUrl, select);
  }
  /// get/list/values/{pageIdentifier}/{controlName}




  getGridData(pageId, dataId, version) {
    return this.http.get<any>(this.getGridDataUrl + pageId + '/data/' + dataId + '/' + version);
  }
  getSelectedData(pageId, dataID, version) {
    return this.http.get<any>(this.getGridDataUrl + pageId + '/data/' + dataID + '/' + version);
  }

  getPageDataByFieldNameAndValue(pageId, fieldName, fieldValue, version) {
    return this.http.get<any>(this.getPageDataByFieldNameAndUrl + pageId + '/field/' + fieldName + '/' + fieldValue + '/' + version);
  }

  getDynamicFieldValues(pageIdentifier, controlName) {
    return this.http.get<any>(this.dynamicOptionsUrl + '/' + pageIdentifier + '/' + controlName);
  }

  getInitialValues(instanceTaskId) {
    return this.http.get<any>(this.getAssignFieldJsonUrl + instanceTaskId, this.token.getHeader());
  }

  getListValues(pageIdentifier, controlName, version) {
    return this.http.get<OptionsValue[]>(this.dynamicOptionsUrl + '/' + pageIdentifier + '/' + controlName + '/' + version);
  }

  getDynamicListByFilterValue(filterVO) {
    return this.http.post<OptionsValue[]>(this.dynamicOptionsByFilterValueUrl, filterVO);
  }

  getDynamicListForAutoComplete(filterVO) {
    return this.http.post<OptionsValue[]>(this.dynamicOptionsForAutoCompleteUrl, filterVO);
  }

  getPublicListValues(pageIdentifier, controlName, version) {
    return this.http.get<OptionsValue[]>(this.publicDynamicOptionsUrl + '/' + pageIdentifier + '/' + controlName + '/' + version);
  }

  getPublicDynamicListByFilterValue(filterVO) {
    return this.http.post<OptionsValue[]>(this.publicDynamicOptionsByFilterValueUrl, filterVO);
  }

  getPublicDynamicListForAutoComplete(filterVO) {
    return this.http.post<OptionsValue[]>(this.publicDynamicOptionsForAutoCompleteUrl, filterVO);
  }

  deleteData(jsonObject) {
    return this.http.post(this.deleteUrl, jsonObject);
  }

  getTaskboardId(taskboardKey: string): Observable<TaskboardVO> {
    return this.http.get<TaskboardVO>(this.getTaskboardIdUrl + taskboardKey);
  }

  saveTaskboardtask(taskboardTask:TaskboardTaskVO){
    return this.http.post<string>(this.saveTaskboardTaskUrl,taskboardTask);
  }

}
