import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FieldVO } from './quill-vo';
import { Observable } from 'rxjs';
import { PageFieldVo } from 'src/app/designer-module/task-property/page-field-vo';

@Injectable({
  providedIn: 'root'
})
export class QuillService {
  private systemVariables = environment.workflowBaseurl + '/system-variables/v1/get';
  private getInitialValuesUrl = environment.baseurl + '/flow/v1/get/assign/fields/';

  constructor(private http: HttpClient) { }

  getSystemVariables(): Observable<FieldVO[]> {
    return this.http.get<FieldVO[]>(this.systemVariables);
  }
  getInitialFields(workflowJson, taskKey) {
    return this.http.post<PageFieldVo[]>(this.getInitialValuesUrl + taskKey, workflowJson);
  }


}
