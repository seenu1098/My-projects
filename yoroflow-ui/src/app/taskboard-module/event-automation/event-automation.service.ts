import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AppConfigurationVO } from '../application-configuration/application-configuration.vo';
import { AutomationByCategory, EventAutomationConfigurationVO, EventAutomationVO } from './event-automation.model';

@Injectable({
  providedIn: 'root'
})
export class EventAutomationService {

  private readonly taskboardAppsSubject = new BehaviorSubject<AppConfigurationVO[]>([]);
  public taskboardApps$ = this.taskboardAppsSubject.asObservable();

  constructor(private http: HttpClient) { }

  private getAutomationConfigurationListUrl = environment.baseurl + '/event-automation/v1/get/automation-configurations/';
  private getAutomationListUrl = environment.baseurl + '/event-automation/v1/get/automation/';
  private saveAutomationUrl = environment.baseurl + '/event-automation/v1/save/automation';
  private setRuleActiveUrl = environment.baseurl + '/event-automation/v1/set/rule-active';
  private deleteAutomationUrl = environment.baseurl + '/event-automation/v1/delete-automation';
  private automationsByCategoryUrl = environment.baseurl + '/event-automation/v1/get/automation-categories/';
  private saveMultipleAutomationsUrl = environment.baseurl + '/event-automation/v1/save/automations';
  private getConfiguredAppsUrl = environment.baseurl + '/app-config/v1/get/config-apps';
  public appIntegrationUrl;
  private getConfiguredAppsByTaskboardIdUrl = environment.workflowBaseurl + '/app-config/v1/get/config-apps/';
  private getOauthUrl = environment.workflowBaseurl + '/org-apps/v1/get/oauth-url';

  public getAutomationConfigurationList(taskboardId: string): Observable<EventAutomationConfigurationVO[]> {
    return this.http.get<EventAutomationConfigurationVO[]>(this.getAutomationConfigurationListUrl + taskboardId);
  }

  public getAutomationList(taskboardId: string): Observable<EventAutomationVO[]> {
    return this.http.get<EventAutomationVO[]>(this.getAutomationListUrl + taskboardId);
  }

  public saveAutomation(eventAutomationVO: EventAutomationVO): Observable<any> {
    return this.http.post<any>(this.saveAutomationUrl, eventAutomationVO);
  }

  public setRuleActive(eventAutomationVO: EventAutomationVO): Observable<any> {
    return this.http.post<any>(this.setRuleActiveUrl, eventAutomationVO);
  }

  public deleteAutomation(eventAutomationVO: EventAutomationVO): Observable<any> {
    return this.http.post<any>(this.deleteAutomationUrl, eventAutomationVO);
  }

  public getAutomationsByCategory(taskboardId: string): Observable<AutomationByCategory[]> {
    return this.http.get<AutomationByCategory[]>(this.automationsByCategoryUrl + taskboardId);
  }

  public saveMultipleAutomations(eventAutomationVO: EventAutomationVO[]): Observable<any> {
    return this.http.post<any>(this.saveMultipleAutomationsUrl, eventAutomationVO);
  }

  public getConfiguredApps(): Observable<AppConfigurationVO[]> {
    return this.http.get<AppConfigurationVO[]>(this.getConfiguredAppsUrl);
  }

  public getConfiguredAppsByTaskboardId(taskboardId: string): void {
    this.http.get<AppConfigurationVO[]>(this.getConfiguredAppsByTaskboardIdUrl + taskboardId)
      .subscribe(apps => this.taskboardAppsSubject.next(apps));
  }

  integrateWithApp(appId: string, taskboardId: string): void {
    this.http.get<any>(this.getOauthUrl).subscribe(data => {
      this.appIntegrationUrl = data.response;
      this.integrate(appId,taskboardId);
    },
      error => {
        this.appIntegrationUrl = 'https://auth.yoroflow.com' + environment.externalProvidersIntegrationUrl;
        this.integrate(appId,taskboardId);
      });
    
  }

  private integrate(appId: string, taskboardId: string):void{
    const windowRef = window.open(
      this.createExternalIntegrationBeginUrl(appId, taskboardId),
      'yoroflow-oauth',
      this.getWindowSizeSpecifications()
    );
    this.pollForIntegrationCompletionAndRefreshApps(windowRef, taskboardId);
  }

  private createExternalIntegrationBeginUrl(appId: string, taskboardId: string): string {
    if (!appId) {
      throw new Error(`App Id is required for external integration url`);
    }
    const domain = window.location.hostname.split('.')[0];
    const token = localStorage.getItem('token');
    return `${this.appIntegrationUrl}/begin-board?domain=${domain}&provider=${appId}&taskboardId=${taskboardId}&token=${token}`;
  }

  private getWindowSizeSpecifications(): string {
    const height = 470;
    const width = 500;
    const left = window.screenLeft + (window.outerWidth - width) / 2;
    const top = window.screenTop + (window.outerHeight - height) / 2;
    return `location=no,toolbar=no,width=${width},height=${height},top=${top},left=${left}`;
  }

  private pollForIntegrationCompletionAndRefreshApps(windowRef: Window, taskboardId: string): void {
    const intervalRef = setInterval(() => {
      if (windowRef.closed) {
        clearInterval(intervalRef);
        this.getConfiguredAppsByTaskboardId(taskboardId);
      }
    }, 1000);
  }
}
