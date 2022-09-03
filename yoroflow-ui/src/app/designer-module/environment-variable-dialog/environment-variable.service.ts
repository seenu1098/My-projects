import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentVariableService {

  constructor(private http: HttpClient) { }

  saveEnvironmentDetailsUrl = environment.workflowBaseurl + '/env-variable/v1/save';
  getEnvironmentDetailsUrl = environment.workflowBaseurl + '/env-variable/v1/get/';

  saveEnvironmentDetails(environmentVariableVO) {
    return this.http.post<any>(this.saveEnvironmentDetailsUrl, environmentVariableVO);
  }

  getEnvironmentDetails(data) {
    return this.http.get<any>(this.getEnvironmentDetailsUrl + data);
  }
}
