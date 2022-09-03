import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Observable } from 'rxjs';
import { TableObjectsVO } from 'src/app/creation-module/table-objects/table-object-vo';
import { PaginationVO } from 'src/app/mytasks-module/mytasks/pagination-vo';
import { Page } from 'src/app/rendering-module/shared/vo/page-vo';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { environment } from 'src/environments/environment';
import { ResponseString } from '../../engine-module/shared/vo/reponse-vo';
import {
  AssignTaskVO,
  FilesVO,
  Subtask,
  TaskboardLabelsVO,
  TaskboardTaskLabelVO,
  TaskboardTaskVO,
  TaskCommentsVO
} from '../taskboard-form-details/taskboard-task-vo';
import { GroupByVO, ReplaceColumnVO, SubStatusVO, TaskboardColumns, TaskboardSubStatusVO, TaskboardTemplatesVO, TaskboardVO, TaskSequenceVO, WorkflowTemplatesVO } from './taskboard.model';

@Injectable({
  providedIn: 'root',
})
export class TaskBoardService {
  public iconsColorArray = ['blue', 'green', 'orange', 'lightblue', 'red'];

  private taskConfigUrl = environment.baseurl + '/taskboard/v1/save/';
  private saveTaskbordTaskUrl =
    environment.baseurl + '/taskboard/v1/save/taskboard-task';
  private getAllTaskboardNamesUrl =
    environment.baseurl + '/taskboard/v1/get/all-taskboard-task/';
  private getTaskboardDetailsUrl = environment.baseurl + '/taskboard/v1/get/';
  private getAllTaskboardDetailsUrl = environment.baseurl + '/taskboard/v1/get/all-task/';
  private getArchivedTaskboardDetailsUrl = environment.baseurl + '/taskboard/v1/get/archive-task/';
  private getDeletedTaskboardDetailsUrl = environment.baseurl + '/taskboard/v1/get/deleted-task/'
  private getCurrentTaskStatus = environment.baseurl + '/taskboard/v1/get/task/';
  private setCurrenttaskStatus =
    environment.baseurl + '/taskboard/v1/save/taskboard-status';
  private getTaskboardTaskUrl = environment.baseurl + '/taskboard/v1/get/taskboard-task/';
  private getWaitingOnUrl = environment.baseurl + '/taskboard/v1/check-waiting-on/';
  private getTaskboardLabelsUrl = environment.baseurl + '/taskboard/v1/get/taskboard-labels/';
  private saveTaskboardLabelsUrl = environment.baseurl + '/taskboard/v1/save/taskboard-labels';
  private getGroupListUrl = environment.baseurl + '/user-management/v1/get/list';
  private getUsersListUrl = environment.baseurl + '/user-service/v1/get/users';
  private getPageByPageIdUrl = environment.renderingBaseUrl + '/page/v1/get-page/';
  private getGeneratedTaskIdListUrl = environment.baseurl + '/taskboard/v1/get/generated-task-id-list';
  private checkTaskboardNameUrl = environment.baseurl + '/taskboard/v1/check-taskboard-name/';
  private downloadFileUrl = environment.baseurl + '/taskboard/v1/download/file/';
  private deleteFileUrl = environment.baseurl + '/taskboard/v1/delete/file';
  private replaceColumnNameUrl = environment.baseurl + '/taskboard/v1/replace/column-name';
  private updateSequenceNumberUrl = environment.baseurl + '/taskboard/v1/update/sequence-number';

  private checkTaskboardKeyUrl = environment.baseurl + '/taskboard/v1/check-taskboard-key/';
  private updateColumnColorUrl = environment.baseurl + '/taskboard/v1/save/update-column-color';
  private saveAssignUserUrl = environment.baseurl + '/taskboard/v1/save/assign-users';
  // private saveSubtaskUrl = environment.baseurl + "/taskboard/v1/save/sub-task";
  private removeSubtaskUrl = environment.baseurl + '/taskboard/v1/remove/sub-task/';
  private saveSubtaskUrl = environment.baseurl + '/taskboard/v1/save/subtask';
  private saveDescriptionUrl = environment.baseurl + '/taskboard/v1/save/description';
  private saveTaskboardLabelUrl = environment.baseurl + '/taskboard/v1/save/taskboard/labels';
  private saveTaskboardTaskLabelUrl = environment.baseurl + '/taskboard/v1/save/taskboard-task/labels';
  private getTaskboardLabelUrl = environment.baseurl + '/taskboard/v1/get/taskboard-labels/';
  private removeTaskboardTaskLabelUrl = environment.baseurl + '/taskboard/v1/remove/taskboard-label/';
  private saveCommentsUrl = environment.baseurl + '/taskboard/v1/save/task/comments';
  private saveStartAndDueDateUrl = environment.baseurl + '/taskboard/v1/save/task-date';
  private getFilesUrl = environment.baseurl + '/taskboard/v1/get/files/';
  private getTaskboardTemplatesUrl = environment.baseurl + '/taskboard-templates/v1/get/templates';
  private templateSaveUrl = environment.baseurl + '/taskboard-templates/v1/save/template';
  private getTableListVOUrl = environment.creationBaseUrl + '/table/v1/get-table-vo-list';
  private getPageNameUrl = environment.creationBaseUrl + '/page/v1/get/pageNames/';
  private savePageUrl = environment.creationBaseUrl + '/page/v1/save/';
  private saveTableListUrl = environment.creationBaseUrl + '/table/v1/save/table-list';
  private savePagePermissionsUrl = environment.renderingBaseUrl + '/page-security/v1/save';
  private saveSubStatusUrl = environment.baseurl + '/sub-status/v1/save/sub-status';
  private getSubStatusUrl = environment.baseurl + '/sub-status/v1/get/sub-status/';
  private getTaskboardTaskByUserUrl = environment.baseurl + '/taskboard/v1/get/taskboard-task-by-user';
  private deletetaskUrl = environment.workflowBaseurl + '/taskboard/v1/delete/task/';
  private archivetaskUrl = environment.workflowBaseurl + '/taskboard/v1/archive/task/';
  private unArchivetaskUrl = environment.workflowBaseurl + '/taskboard/v1/unarchive/task/';
  private unDeletetaskUrl = environment.workflowBaseurl + '/taskboard/v1/undelete/task/';
  private workflowTemplatesUrl = environment.workflowBaseurl + '/workflow-templates/v1/get/templates';
  private isAllowedUrl = environment.workflowBaseurl + '/taskboard/v1/license/is-allowed';
  private getLicenseForTaskboardUrl = environment.workflowBaseurl + '/taskboard/v1/get-user-license/taskboard';
  private isAllAllowedUrl = environment.baseurl + '/flow/v1/license/is-allowed';
  private savePriorityUrl = environment.workflowBaseurl + '/taskboard/v1/save/task-priority';
  private saveDependencyUrl = environment.workflowBaseurl + '/task-dependency/v1/save';
  private removeDependencyUrl = environment.workflowBaseurl + '/task-dependency/v1/remove/';
  private getAllTasksUrl = environment.workflowBaseurl + '/taskboard/v1/get/all-tasks/';
  private getDoneTaskboardTasksUrl = environment.baseurl + '/taskboard/v1/get/done/';
  private getTaskboardDetailsByTypeUrl = environment.baseurl + '/taskboard/v1/get/';
  private deleteTaskboardUrl = environment.baseurl + '/taskboard/v1/delete/';
  private allDoneTasksUrl = environment.baseurl + '/taskboard/v1/get-all/done/';
  private saveTasksToSprintUrl = environment.baseurl + '/sprint/v1/sprint-task/save';
  private getSprintTasksUrl = environment.baseurl + '/taskboard/v1/get-sprint-task/';
  private getDoneSprintTaskUrl = environment.baseurl + '/taskboard/v1/get/done-sprint-task/';
  private sprintStartUrl = environment.baseurl + '/sprint/v1/sprint/start/';
  private checkSprintStartUrl = environment.baseurl + '/sprint/v1/sprint/check-start/';
  private sprintCompleteUrl = environment.baseurl + '/sprint/v1/sprint/complete/';
  private sprintDeleteUrl = environment.baseurl + '/sprint/v1/sprint/delete/';
  private saveTaskPointUrl = environment.baseurl + '/sprint/v1/save/original-points';
  private saveEstimateHoursUrl = environment.baseurl + '/sprint/v1/save/task-estimate-hours';
  private getSprintTaskboardTaskUrl = environment.baseurl + '/taskboard/v1/get/taskboard-task/';
  private taskboardFieldsUrl = environment.baseurl + '/taskboard/v1/get-initial-fields';
  private resolveTaskboardFieldsUrl = environment.baseurl + '/taskboard/v1/resolve-initial-fields/';
  private removeColumnUrl = environment.baseurl + '/taskboard/v1/delete/column/';
  private getTaskboardExcelUrl = environment.baseurl + '/taskboard/v1/get-excel';
  private isEmptyTaskboardUrl = environment.baseurl + '/taskboard/v1/is-empty-taskboard';
  private groupByTaskboardUrl = environment.baseurl + '/taskboard/v1/get-group-by-task';
  private getAssigneeTaskByHorizontalUrl = environment.baseurl + '/taskboard/v1/get-assignee-group-by-horizontal';
  private getAssigneeTaskByVerticalUrl = environment.baseurl + '/taskboard/v1/get-assignee-group-by-vertical';
  private getDoneTaskByGroupByUrl = environment.baseurl + '/taskboard/v1/get-done-filter';
  private getDoneTaskByGroupByCountUrl = environment.baseurl + '/taskboard/v1/get-done-filter-count';

  constructor(private http: HttpClient, private workspaceService: WorkspaceService) { }

  public saveTasksToSprint(sprintTasks: any): Observable<any> {
    return this.http.post<any>(this.saveTasksToSprintUrl, sprintTasks);
  }

  public checkSprintTasksRunning(sprintId: any): Observable<any> {
    return this.http.get<any>(this.checkSprintStartUrl + sprintId);
  }

  public posttaskConfiguration(data: TaskboardVO): Observable<any> {
    return this.http.post<ResponseString>(this.taskConfigUrl + this.workspaceService.workspaceID, data);
  }

  public saveTaskboardTask(taskBoardTaskVO: TaskboardTaskVO): Observable<any> {
    return this.http.post<any>(this.saveTaskbordTaskUrl, taskBoardTaskVO);
  }

  public getAlltaskboardNames(): Observable<any> {
    return this.http.get<any>(this.getAllTaskboardNamesUrl + this.workspaceService.workspaceID);
  }

  public getTaskboardDetails(id: string): Observable<TaskboardVO> {
    return this.http.get<TaskboardVO>(this.getTaskboardDetailsUrl + id);
  }

  public getAllTaskboardDetails(id: string): Observable<any> {
    return this.http.get<any>(this.getAllTaskboardDetailsUrl + id);
  }

  public getArchivedTaskboardDetails(id: string): Observable<any> {
    return this.http.get<any>(this.getArchivedTaskboardDetailsUrl + id);
  }
  public getDeletedTaskboardDetails(id: string): Observable<any> {
    return this.http.get<any>(this.getDeletedTaskboardDetailsUrl + id);

  }

  public getStatus(id: string): Observable<any> {
    return this.http.get<any>(this.getCurrentTaskStatus + id);
  }

  public setTaskBoardStatus(taskboardTaskVO: TaskboardTaskVO): Observable<any> {
    return this.http.post<any>(this.setCurrenttaskStatus, taskboardTaskVO);
  }

  public getTaskboardTask(id: string, sprintId: string): Observable<TaskboardTaskVO> {
    if (sprintId === null) {
      return this.http.get<TaskboardTaskVO>(this.getTaskboardTaskUrl + id);
    } else {
      return this.http.get<TaskboardTaskVO>(this.getSprintTaskboardTaskUrl + id + '/' + sprintId);
    }
  }

  public getCheckWaitingOn(id: string): Observable<TaskboardTaskVO> {
    return this.http.get<TaskboardTaskVO>(this.getWaitingOnUrl + id);
  }

  public getTaskboardLabels(id: string): Observable<any> {
    return this.http.get<any>(this.getTaskboardLabelsUrl + id);
  }

  public saveTaskboardLebles(
    taskboardLabels: TaskboardLabelsVO
  ): Observable<any> {
    return this.http.post<any>(this.saveTaskboardLabelsUrl, taskboardLabels);
  }

  public getTaskIdDetails(formId: string, version: any): Observable<any> {
    return this.http.get<any>(
      this.getPageByPageIdUrl + formId + '/' + version
    );
  }

  public getUserGroupList(): Observable<any> {
    return this.http.get<any>(this.getGroupListUrl);
  }

  public getUsersList(): Observable<any> {
    return this.http.get<any>(this.getUsersListUrl);
  }

  public getGeneratedTaskIdList() {
    return this.http.get<any>(this.getGeneratedTaskIdListUrl);
  }

  public checkTaskboardName(name) {
    return this.http.get<any>(this.checkTaskboardNameUrl + name);
  }

  public downloadAttachedFile(fileId: string) {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        observe: 'response' as 'response'
      })
    };
    return this.http.get<any>(this.downloadFileUrl + fileId, httpOptions);
  }

  public deleteFile(filesVO: FilesVO) {
    return this.http.post<any>(this.deleteFileUrl, filesVO);
  }
  public checkTaskboardKey(key) {
    return this.http.get<any>(this.checkTaskboardKeyUrl + key);
  }

  public replaceColumn(replaceColumnVO: ReplaceColumnVO) {
    return this.http.post<ResponseString>(this.replaceColumnNameUrl, replaceColumnVO);
  }

  public updateSequenceNumber(taskSequenceVO: TaskSequenceVO) {
    return this.http.post<ResponseString>(this.updateSequenceNumberUrl, taskSequenceVO);
  }

  public updateColumnColor(updateColumnColor: TaskboardColumns) {
    return this.http.post<ResponseString>(this.updateColumnColorUrl, updateColumnColor);
  }

  public saveAssigneeUser(taskboardTaskVO: TaskboardTaskVO): Observable<ResponseString> {
    return this.http.post<ResponseString>(this.saveAssignUserUrl, taskboardTaskVO);
  }

  // public saveSubtask(taskboardTaskVO: TaskboardTaskVO): Observable<any> {
  //   return this.http.post<any>(this.saveSubtaskUrl, taskboardTaskVO);
  // }

  public saveSubtask(vo: Subtask): Observable<any> {
    return this.http.post<any>(this.saveSubtaskUrl, vo);
  }

  public removeSubtask(taskId: String): Observable<ResponseString> {
    return this.http.get<ResponseString>(this.removeSubtaskUrl + taskId);
  }

  public saveDescription(taskboardTaskVO: TaskboardTaskVO): Observable<ResponseString> {
    return this.http.post<ResponseString>(this.saveDescriptionUrl, taskboardTaskVO);
  }

  public saveTaskboardLabel(taskboardLabelsVO: TaskboardLabelsVO): Observable<any> {
    return this.http.post<any>(this.saveTaskboardLabelUrl, taskboardLabelsVO);
  }

  public saveTaskboardTaskLabel(taskboardTaskLabelVO: TaskboardTaskLabelVO): Observable<any> {
    return this.http.post<any>(this.saveTaskboardTaskLabelUrl, taskboardTaskLabelVO);
  }

  public getTaskboardLabelsList(taskboardId: String): Observable<TaskboardLabelsVO> {
    return this.http.get<TaskboardLabelsVO>(this.getTaskboardLabelUrl + taskboardId);
  }

  public removeLabel(id: string): Observable<ResponseString> {
    return this.http.get<ResponseString>(this.removeTaskboardTaskLabelUrl + id);
  }

  public saveComments(taskComments: TaskCommentsVO): Observable<ResponseString> {
    return this.http.post<ResponseString>(this.saveCommentsUrl, taskComments);
  }

  public saveStartAndDueDate(taskboardTaskVO: TaskboardTaskVO): Observable<ResponseString> {
    return this.http.post<ResponseString>(this.saveStartAndDueDateUrl, taskboardTaskVO);
  }

  public getFiles(taskId: string): Observable<FilesVO[]> {
    return this.http.get<FilesVO[]>(this.getFilesUrl + taskId);
  }
  public getTaskboardTemplates(): Observable<TaskboardTemplatesVO[]> {
    return this.http.get<TaskboardTemplatesVO[]>(this.getTaskboardTemplatesUrl);
  }

  public temaplateSave(templateVO: TaskboardTemplatesVO): Observable<ResponseString> {
    return this.http.post<ResponseString>(this.templateSaveUrl, templateVO);
  }

  public getTableListVO(tableListVO): Observable<any> {
    return this.http.post<any>(this.getTableListVOUrl, tableListVO);
  }

  public getPageNameList(): Observable<any> {
    return this.http.get<any>(this.getPageNameUrl + this.workspaceService.workspaceID);
  }

  public savePage(pageVO: Page): Observable<any> {
    return this.http.post<any>(this.savePageUrl + this.workspaceService.workspaceID, pageVO);
  }

  public saveTableListVO(tableList: TableObjectsVO[]): Observable<any> {
    return this.http.post<any>(this.saveTableListUrl, tableList);
  }

  public savePagePermissions(permissions): Observable<ResponseString> {
    return this.http.post<ResponseString>(this.savePagePermissionsUrl, permissions);
  }

  public saveSubStatus(taskboardSubStatusVO: TaskboardSubStatusVO): Observable<SubStatusVO[]> {
    return this.http.post<SubStatusVO[]>(this.saveSubStatusUrl, taskboardSubStatusVO);
  }

  public getSubStatus(taskboardColumnId: string): Observable<SubStatusVO[]> {
    return this.http.get<SubStatusVO[]>(this.getSubStatusUrl + taskboardColumnId);
  }
  public getTaskboardTaskByUser(aasignTaskVO, sprintId): Observable<any> {
    if (sprintId !== null && sprintId !== undefined) {
      return this.http.post<any>(this.getTaskboardTaskByUserUrl + '/' + sprintId, aasignTaskVO);
    }
    return this.http.post<any>(this.getTaskboardTaskByUserUrl, aasignTaskVO);
  }
  public removeTask(id): Observable<any> {
    return this.http.delete<any>(this.deletetaskUrl + id);

  }
  public archiveTask(id): Observable<any> {
    return this.http.get<any>(this.archivetaskUrl + id);
  }

  public unArchiveTask(id): Observable<any> {
    return this.http.get<any>(this.unArchivetaskUrl + id);
  }
  public unDeleteTask(id): Observable<any> {
    return this.http.get<any>(this.unDeletetaskUrl + id);
  }

  public getWorkflowTemplates(): Observable<WorkflowTemplatesVO[]> {
    return this.http.get<WorkflowTemplatesVO[]>(this.workflowTemplatesUrl);
  }

  public isAllowed(): Observable<any> {
    return this.http.get<ResponseString>(this.isAllowedUrl);
  }

  isAllAllowed(licenseVO) {
    return this.http.post<any>(this.isAllAllowedUrl, licenseVO);
  }

  public getUserLicenseForTaskboard() {
    return this.http.get<any>(this.getLicenseForTaskboardUrl);
  }

  public savePriority(taskVO: TaskboardTaskVO): Observable<ResponseString> {
    return this.http.post<ResponseString>(this.savePriorityUrl, taskVO);
  }

  public saveDependency(taskDependencies: any): Observable<any> {
    return this.http.post<any>(this.saveDependencyUrl, taskDependencies);
  }

  public removeDependency(dependencyId: string): Observable<ResponseString> {
    return this.http.get<ResponseString>(this.removeDependencyUrl + dependencyId);
  }

  public getAllTasks(taskboardId: string): Observable<TaskboardTaskVO[]> {
    return this.http.get<TaskboardTaskVO[]>(this.getAllTasksUrl + taskboardId);
  }

  public getDoneTaskoardTask(taskboardId: string): Observable<any> {
    return this.http.get<any>(this.getDoneTaskboardTasksUrl + taskboardId);
  }

  public getAllDoneTasks(taskboardId: string): Observable<any> {
    return this.http.get<any>(this.allDoneTasksUrl + taskboardId);
  }

  public getTaskboardDetailsByType(id: string, index: any): Observable<TaskboardVO> {
    return this.http.get<TaskboardVO>(this.getTaskboardDetailsByTypeUrl + id + '/' + index);
  }

  public deleteTaskboard(taskboardId: string): Observable<ResponseString> {
    return this.http.get<ResponseString>(this.deleteTaskboardUrl + taskboardId);
  }

  public getSprintTasks(sprintId: string, taskboardId: string, index: number): Observable<TaskboardVO> {
    return this.http.get<TaskboardVO>(this.getSprintTasksUrl + taskboardId + '/' + sprintId + '/' + index);
  }

  public getSprintDoneTasks(sprintId: string, taskboardId: string): Observable<TaskboardTaskVO[]> {
    return this.http.get<TaskboardTaskVO[]>(this.getDoneSprintTaskUrl + taskboardId + '/' + sprintId);
  }

  public startSprint(sprintId: string): Observable<any> {
    return this.http.get<any>(this.sprintStartUrl + sprintId);
  }

  public deleteSprint(sprintId: string): Observable<any> {
    return this.http.get<any>(this.sprintDeleteUrl + sprintId);
  }

  public saveEstimatePoints(taskboardTaskVO: TaskboardTaskVO): Observable<any> {
    return this.http.post<any>(this.saveTaskPointUrl, taskboardTaskVO);
  }

  public saveEstimateHours(taskboardTaskVO: TaskboardTaskVO): Observable<any> {
    return this.http.post<any>(this.saveEstimateHoursUrl, taskboardTaskVO);
  }

  public completeSprint(sprintId: string): Observable<any> {
    return this.http.get<any>(this.sprintCompleteUrl + sprintId);
  }

  public taskboardFields(): Observable<any> {
    return this.http.get<any>(this.taskboardFieldsUrl);
  }

  public resolvetaskboardFields(taskboardId: any): Observable<any> {
    return this.http.get<any>(this.resolveTaskboardFieldsUrl + taskboardId);
  }
  public removeColumn(id: string) {
    return this.http.get<any>(this.removeColumnUrl + id);
  }

  getExcelData(taskboardExcelVO) {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        observe: 'response' as 'response'
      })
    };
    return this.http.post<any>(this.getTaskboardExcelUrl, taskboardExcelVO, httpOptions);
  }

  public isEmptyTaskboard(taskboardExcelVO) {
    return this.http.post<any>(this.isEmptyTaskboardUrl, taskboardExcelVO);
  }

  public groupByTaskboard(groupByVO: GroupByVO): Observable<any> {
    return this.http.post<any>(this.groupByTaskboardUrl, groupByVO);
  }

  public getAssigneeGroupTaskByHorizontal(groupByVO: GroupByVO): Observable<any> {
    return this.http.post<any>(this.getAssigneeTaskByHorizontalUrl, groupByVO);
  }

  public getAssigneeGroupTaskByVertical(groupByVO: GroupByVO): Observable<any> {
    return this.http.post<any>(this.getAssigneeTaskByVerticalUrl, groupByVO);
  }

  public getDoneTaskWithGroupByVO(groupByVO: GroupByVO): Observable<any> {
    return this.http.post<any>(this.getDoneTaskByGroupByUrl, groupByVO);
  }

  public getDoneTaskWithGroupByCount(groupByVO: GroupByVO): Observable<any> {
    return this.http.post<any>(this.getDoneTaskByGroupByCountUrl, groupByVO);
  }
}
