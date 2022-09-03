import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ProcessInstanceTaskListService {

  constructor(private http: HttpClient) { }

  getProcessInstanceTaskListUrl = environment.workflowBaseurl + '/board/v1/get/process-instance-task/list';
  getPropertyValueUrl = environment.workflowBaseurl + '/board/v1/get/property-value/';

  getProcessInstanceTaskList(paginationVO) {
    return this.http.post<any>(this.getProcessInstanceTaskListUrl, paginationVO);
  }

  getPropertyValue(id) {
    return this.http.get<any>(this.getPropertyValueUrl + id);
  }
}
