import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { BehaviorSubject, interval, Observable, Subject } from 'rxjs';
import { mergeMap, take, takeUntil } from 'rxjs/operators';
import { ResponseString } from 'src/app/engine-module/shared/vo/reponse-vo';
import { environment } from 'src/environments/environment';
import { AppConfigurationVO } from '../application-configuration/application-configuration.vo';
import { AppIntegrationVO, OrganizationIntegratedAppsVO } from './integrate-application.vo';

@Injectable({
  providedIn: 'root',
})
export class IntegrateApplicationService {
  constructor(private http: HttpClient) { }

  private readonly organizationIntegratedAppsSubject = new BehaviorSubject<
    OrganizationIntegratedAppsVO[]
  >([]);

  orgIntegratedApps$ = this.organizationIntegratedAppsSubject.asObservable();

  @Output() public windowClosedEmitter: EventEmitter<boolean> = new EventEmitter<any>();

  private getApplicationsUrl =
    environment.workflowBaseurl + '/app-integrate/v1/get/apps';
  private saveApplicationsUrl =
    environment.workflowBaseurl + '/org-apps/v1/save';
  private getOrganizationAppsUrl =
    environment.workflowBaseurl + '/org-apps/v1/get/apps';
  private getTaskboardAppsUrl =
    environment.workflowBaseurl + '/app-config/v1/get/taskboard-apps/';
  private appIntegrationUrl = environment.externalProvidersIntegrationUrl;
  private removeApplicationUrl = environment.workflowBaseurl + '/org-apps/v1/remove/application/';
  private getOauthUrl = environment.workflowBaseurl + '/org-apps/v1/get/oauth-url';

  getApplications(): Observable<AppIntegrationVO[]> {
    return this.http.get<AppIntegrationVO[]>(this.getApplicationsUrl);
  }

  saveOrganizationApplications(
    orgApps: OrganizationIntegratedAppsVO
  ): Observable<OrganizationIntegratedAppsVO[]> {
    return this.http.post<OrganizationIntegratedAppsVO[]>(
      this.saveApplicationsUrl,
      orgApps
    );
  }

  getOrganizationApplications(): Observable<OrganizationIntegratedAppsVO[]> {
    return this.http.get<OrganizationIntegratedAppsVO[]>(
      this.getOrganizationAppsUrl
    );
  }

  getOrganizationApplicationsAsync(): void {
    this.http.get<OrganizationIntegratedAppsVO[]>(
      this.getOrganizationAppsUrl
    ).subscribe(apps => {
      this.organizationIntegratedAppsSubject.next(apps);
    });
  }

  getTaskboardApps(applicationName: string): Observable<ResponseString> {
    return this.http.get<ResponseString>(this.getTaskboardAppsUrl + applicationName);
  }

  integrateWithApp(appId: string, clientId): void {
    if (clientId !== null) {
      this.appIntegrationUrl = window.location.origin + environment.externalProvidersIntegrationUrl;
      this.integrate(appId, clientId);
    } else {
    this.http.get<any>(this.getOauthUrl).subscribe(data => {
      this.appIntegrationUrl = data.response;
      this.integrate(appId, null);
    },
      error => {
        this.appIntegrationUrl = 'https://auth.yoroflow.com' + environment.externalProvidersIntegrationUrl;
        this.integrate(appId, null);
      });
    }
  }

  integrate(appId: string, clientId): void {
    const windowRef = window.open(
      this.createExternalIntegrationBeginUrl(appId, clientId),
      'yoroflow-oauth',
      this.getWindowSizeSpecifications()
    );
    this.pollForIntegrationCompletionAndRefreshApps(windowRef);
  }

  private createExternalIntegrationBeginUrl(appId: string, clientId): string {
    if (!appId) {
      throw new Error(`App Id is required for external integration url`);
    }
    let subDomain: string;
    if (window.location.href.includes('yoroflow.com')) {
      subDomain = window.location.origin;
    } else {
      subDomain = 'localhost:4200';
    }
    const domain = localStorage.getItem('token');
    localStorage.setItem('oauthUrl', this.appIntegrationUrl);
    return `${this.appIntegrationUrl}/begin?domain=${subDomain}&provider=${appId}&token=${localStorage.getItem('token')}&login=login&loginType=${clientId}`;
  }

  private getWindowSizeSpecifications(): string {
    const height = 470;
    const width = 500;
    const left = window.screenLeft + (window.outerWidth - width) / 2;
    const top = window.screenTop + (window.outerHeight - height) / 2;
    return `location=no,toolbar=no,width=${width},height=${height},top=${top},left=${left}`;
  }

  private pollForIntegrationCompletionAndRefreshApps(windowRef: Window): void {
    const intervalRef = setInterval(() => {
      if (windowRef.closed) {
        clearInterval(intervalRef);
        // this.getOrganizationApplicationsAsync();
        this.windowClosedEmitter.emit(true);
      }
    }, 1000);
  }

  public getApplicationsAsync(): Observable<AppIntegrationVO[]> {
    return this.http.get<AppIntegrationVO[]>(this.getApplicationsUrl);
  }

  public removeApplication(applicationId: string): Observable<ResponseString> {
    return this.http.get<ResponseString>(this.removeApplicationUrl + applicationId);
  }
}
