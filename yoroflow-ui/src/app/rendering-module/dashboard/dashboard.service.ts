import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Application } from '../application-provision/appication-vo';
import { environment } from '../../../environments/environment';
import { ResponseString } from '../shared/vo/response-vo';
import { ApplicationDetailsVO } from './application-details-vo';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient, private workspaceService: WorkspaceService) { }

  getApplicationistUrl = environment.renderingBaseUrl + '/application/v1/get-list/';
  deleteApplicationUrl = environment.renderingBaseUrl + '/application/v1/delete/';
  getApplicationLogoUrl = environment.renderingBaseUrl + '/application/v1/get/logo';
  getApplicationPermissionListUrl = environment.renderingBaseUrl + '/application/v1/get-permission-list';

  getApplicationList() {
    return this.http.get<Application[]>(this.getApplicationistUrl + this.workspaceService.workspaceID);
  }

  deleteApplication(id: string) {
    return this.http.delete<ResponseString>(this.deleteApplicationUrl + id);
  }

  getApplicationLogo(applicationIdList) {
    return this.http.post<any>(this.getApplicationLogoUrl, applicationIdList);
  }

  getApplicationPermission(applicationList) {
    return this.http.post<any>(this.getApplicationPermissionListUrl, applicationList);
  }
}
