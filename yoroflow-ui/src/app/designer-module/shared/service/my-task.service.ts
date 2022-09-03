import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TaskNotes } from '../../open-form-dialog-box/task-notes-vo';

// import { TaskNotes } from '../../open-form-dialog-box/task-notes-vo';


@Injectable({
  providedIn: 'root'
})
export class MyTaskService {

  constructor(private http: HttpClient) { }

  private getInitialValuesJsonUrl = environment.baseurl + '/flow/v1/get/assign/fields/';
  private getTaskUrl = environment.baseurl + '/mytask/v1/get/';

  private getTaskNoteslListUrl = environment.baseurl + '/task-notes/v1/get-list/';
  private saveTaskNotesUrl = environment.baseurl + '/task-notes/v1/create';

  private setAssignedToUrl = environment.baseurl + '/mytask/v1/set-assign-task';

  saveTaskNotes(notesVO) {
    return this.http.post<any>(this.saveTaskNotesUrl, notesVO);
  }

  getTaskNotesList(instanceTaskId) {
    return this.http.get<TaskNotes[]>(this.getTaskNoteslListUrl + instanceTaskId);
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
}
