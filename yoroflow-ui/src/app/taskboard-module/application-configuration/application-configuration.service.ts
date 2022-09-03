import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseString } from 'src/app/engine-module/shared/vo/reponse-vo';
import { environment } from 'src/environments/environment';
import { AppConfigurationVO } from './application-configuration.vo';

@Injectable({
  providedIn: 'root'
})
export class ApplicationConfigurationService {

  constructor(private http: HttpClient) { }

  private saveAppConnfigUrl = environment.workflowBaseurl + '/app-config/v1/save';
  private getConfiguredAppUrl = environment.workflowBaseurl + '/app-config/v1/get/';
  private getConfiguredAppsByTaskboardIdUrl = environment.workflowBaseurl + '/app-config/v1/get/config-apps/';

  saveAppConfig(appConfig: AppConfigurationVO): Observable<ResponseString> {
    return this.http.post<ResponseString>(this.saveAppConnfigUrl, appConfig);
  }

  getConfiguredApp(appName: string): Observable<AppConfigurationVO> {
    return this.http.get<AppConfigurationVO>(this.getConfiguredAppUrl + appName);
  }

  getConfiguredAppsByTaskboardId(taskboardId: string): Observable<AppConfigurationVO[]> {
    return this.http.get<AppConfigurationVO[]>(this.getConfiguredAppsByTaskboardIdUrl + taskboardId);
  }
}
