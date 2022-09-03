import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrganizationIntegratedAppsVO } from 'src/app/taskboard-module/integrate-application/integrate-application.vo';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IntegrationService {

  constructor(private http: HttpClient) { }

  private getOrganizationAppsUrl = environment.workflowBaseurl + '/org-apps/v1/get/apps';

  getOrganizationApplications(): Observable<OrganizationIntegratedAppsVO[]> {
    return this.http.get<OrganizationIntegratedAppsVO[]>(this.getOrganizationAppsUrl);
  }
}
