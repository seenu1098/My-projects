import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AdhocTask } from '../vo/adhoc-task-vo';



@Injectable({
  providedIn: 'root'
})
export class AdhocTaskService {

  constructor(private http: HttpClient) { }

  createAdhocTaskUrl = environment.baseurl + '/workflow-controller/v1/create/adhocTask';
  getAdhocTaskListUrl = environment.baseurl + '/workflow-controller/v1/get/all/adhocTask';
  getAdhocTaskInfoUrl = environment.baseurl + '/workflow-controller/v1/get/adhocTask/';
  createTaskNotesUrl = environment.baseurl + '/workflow-controller/v1/create/notes';
  deleteNotesUrl = environment.baseurl + '/workflow-controller/v1/delete/note/';
  deleteFilesUrl = environment.baseurl + '/workflow-controller/v1/delete/file/';
  getTaskNotesUrl = environment.baseurl + '/workflow-controller/v1/get/notes/';
  saveTaskFilesUrl = environment.baseurl + '/workflow-controller/v1/save/files';
  getTaskFilesUrl = environment.baseurl + '/workflow-controller/v1/get/files/';
  showFilesUrl = environment.baseurl + '/workflow-controller/v1/show/files/';

  createAdhocTask(adhocTask: AdhocTask) {
    return this.http.post<any>(this.createAdhocTaskUrl, adhocTask.files);
  }

  createNotes(adhocTask: AdhocTask) {
    return this.http.post<any>(this.createTaskNotesUrl, adhocTask);
  }

  getAdhocTaskList() {
    return this.http.get<any>(this.getAdhocTaskListUrl);
  }

  getAdhocTaskInfo(id) {
    return this.http.get<any>(this.getAdhocTaskInfoUrl + id);
  }

  deleteNotes(id) {
    return this.http.get<any>(this.deleteNotesUrl + id);
  }

  deleteFiles(id) {
    return this.http.get<any>(this.deleteFilesUrl + id);
  }

  getTaskNotes(id) {
    return this.http.get<any>(this.getTaskNotesUrl + id);
  }

  saveTaskFiles(adhocTask: AdhocTask) {
    return this.http.post<any>(this.saveTaskFilesUrl, adhocTask.files);
  }

  getTaskFiles(id) {
    return this.http.get<any>(this.getTaskFilesUrl + id);
  }

  showFiles(id) {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        observe: 'response' as 'response'
      })
    };
    return this.http.get<any>(this.showFilesUrl + id, httpOptions);
  }

}
