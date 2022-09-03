import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PaginationVO } from '../mytasks-module/mytasks/pagination-vo';
import { environment } from '../../environments/environment';
import { WorkspaceService } from '../workspace-module/create-dialog/workspace.service';
import { Observable } from 'rxjs';
import { MyTaskService } from '../mytasks-module/mytasks/my-task.service';


@Injectable({
  providedIn: 'root'
})
export class TasklistService {

  @Output() public myTaskLaunchEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private http: HttpClient, private workspaceService: WorkspaceService, private myTaskService: MyTaskService) { }

  private tasklist = environment.baseurl + '/mytask/v1/get-all-list/';
  private launchedList = environment.baseurl + '/mytask/v1/get-launched-list/';
  reassignTaskUrl = environment.baseurl + '/mytask/v1/reassign-task';
  private cancelTaskUrl = environment.baseurl + '/flow/v1/cancel-task';
  private filterlist = environment.baseurl + '/mytask/v1/filter-task-list/';
  private tasklistForWildSearch = environment.baseurl + '/mytask/v1/wild-search/get-list/';
  private getErrorDetailsUrl = environment.baseurl + '/error/v1/get/';
  private taskNameListUrl = environment.baseurl + '/mytask/v1/get-all-task-names/';
  private taskCountUrl = environment.baseurl + '/mytask/v1/get-all-task-names-count/';

  myTasksCount = 0;

  cancelTask(taskDetailsRequest) {
    return this.http.post(this.cancelTaskUrl, taskDetailsRequest);
  }

  reAssignTask(taskData) {
    return this.http.post(this.reassignTaskUrl, taskData);
  }

  getTaskList(pagination: PaginationVO) {
    if (!pagination.direction) {
      pagination.direction = 'asc';
    }
    if (!pagination.size) {
      pagination.size = 5;
    }
    pagination.forFilterList = false;
    if (pagination.taskStatus === 'launched') {
      return this.http.post<any>(this.launchedList + this.workspaceService.workspaceID, pagination);
    } else if (pagination.wildSearch && pagination.wildSearch !== '' && pagination.wildSearch !== null) {
      return this.http.post<any>(this.tasklistForWildSearch + this.workspaceService.workspaceID, pagination);
    } else {
      return this.http.post<any>(this.tasklist + this.workspaceService.workspaceID, pagination);
    }
  }

  getFilterList(pagination: PaginationVO) {
    pagination.forFilterList = true;
    return this.http.post<any>(this.filterlist + this.workspaceService.workspaceID, pagination);
  }

  getErrorTaskDetails(instanceId) {
    return this.http.get<any>(this.getErrorDetailsUrl + instanceId);
  }

  getAllTaskNames(isWorkspace: boolean): Observable<any> {
    return this.http.get<any>(this.taskNameListUrl + this.workspaceService.workspaceID + '/' + isWorkspace);
  }

  getTaskCount(isWorkspace: boolean): Observable<any> {
    return this.http.get<any>(this.taskCountUrl + this.workspaceService.workspaceID + '/' + isWorkspace);
  }

  setMyTaskCount() {
    this.getTaskCount(this.myTaskService.isWorkspace).subscribe(data => {
      if (data) {
        this.myTasksCount = ((+data.totalAssignedRecordsCount) + (+data.totalGroupRecordsCount));
      }
    });
  }

  invokeLaunchEmitter() {
    // this.setMyTaskCount();
    this.myTaskLaunchEmitter.emit(true);
  }

}
