import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TaskNotes } from 'src/app/engine-module/open-form-dialog-box/task-notes-vo';
import { ResponseString } from 'src/app/engine-module/shared/vo/reponse-vo';
import { Observable } from 'rxjs';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { PaginationVO } from 'src/app/shared-module/yorogrid/pagination-vo';
@Injectable({
  providedIn: 'root'
})
export class MyTaskService {

  @Output() public isWorkspaceEmit: EventEmitter<boolean> = new EventEmitter<boolean>();
  isWorkspace = false;

  constructor(private http: HttpClient, private workspaceService: WorkspaceService) { }

  private getInitialValuesJsonUrl = environment.baseurl + '/flow/v1/get/assign/fields/';
  private getTaskUrl = environment.baseurl + '/mytask/v1/get/';

  private getTaskNoteslListUrl = environment.baseurl + '/task-notes/v1/get-list/';
  private getTaskNoteslListForSendBackUrl = environment.baseurl + '/task-notes/v1/get-list/send-back/';
  private saveTaskNotesUrl = environment.baseurl + '/task-notes/v1/create';

  private setAssignedToUrl = environment.baseurl + '/mytask/v1/set-assign-task';
  private getTaskBackgroundUrl = environment.baseurl + '/mytask/v1/get-task-background';

  private getTaskListCountUrl = environment.baseurl + '/mytask/v1/get-list-count/';
  private getPinedWorkflowsUrl = environment.baseurl + '/flow/v1/get/pin-workflows/';
  private saveCommentsUrl = environment.baseurl + '/task-notes/v1/save';
  private getUsersListUrl = environment.baseurl + '/user-service/v1/get/users';
  private getTaskNotesUrl = environment.baseurl + '/task-notes/v1/get-notes/';
  private getSubmittedTasksUrl = environment.baseurl + '/request/v1/get/submitted-task/';

  saveTaskNotes(notesVO) {
    return this.http.post<any>(this.saveTaskNotesUrl, notesVO);
  }

  getTaskNotesList(instanceTaskId) {
    return this.http.get<TaskNotes[]>(this.getTaskNoteslListUrl + instanceTaskId);
  }

  getTaskNotesListForSendBack(instanceTaskId, eventTaskId) {
    return this.http.get<TaskNotes[]>(this.getTaskNoteslListForSendBackUrl + instanceTaskId + '/' + eventTaskId);
  }
  getInitialFieldsJson(instanceTaskID) {
    return this.http.get<any>(this.getInitialValuesJsonUrl + instanceTaskID);
  }

  getTaskInfo(instanceTaskId) {
    return this.http.get<any>(this.getTaskUrl + instanceTaskId);
  }

  setAssignedTo(vo) {
    return this.http.post<any>(this.setAssignedToUrl, vo);
  }

  getTaskBackground() {
    return this.http.get<any>(this.getTaskBackgroundUrl);
  }

  getTotalTaskCount() {
    return this.http.get<any>(this.getTaskListCountUrl + this.workspaceService.workspaceID);
  }

  getPinedWorkflow() {
    return this.http.get<any>(this.getPinedWorkflowsUrl + this.workspaceService.workspaceID);
  }

  saveComments(taskNote: TaskNotes): Observable<ResponseString> {
    return this.http.post<ResponseString>(this.saveCommentsUrl, taskNote);
  }

  public getUsersList(): Observable<any> {
    return this.http.get<any>(this.getUsersListUrl);
  }

  public getTaskNotes(taskId: string): Observable<any> {
    return this.http.get<any>(this.getTaskNotesUrl + taskId);
  }

  getTeamList() {
    return this.http.get<any[]>(environment.renderingBaseUrl + '/group/v1/get/all-groups');
  }

  getSubmittedTasks(paginationVO: PaginationVO, workspaceId: string): Observable<any> {
    return this.http.post<any>(this.getSubmittedTasksUrl + workspaceId, paginationVO);
  }

  invokeWorkspaceTasksEmit(isWorkspace: boolean): void {
    this.isWorkspace = isWorkspace;
    this.isWorkspaceEmit.emit(isWorkspace);
  }

  // setWorkspace(isWorkspace: boolean): void {
  //   this.isWorkspace = isWorkspace;
  //   this.isWorkspaceEmit.emit(isWorkspace);
  // }
}
