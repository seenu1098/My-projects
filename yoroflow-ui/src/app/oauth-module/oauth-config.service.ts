import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthConfig } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { OrganizationIntegratedAppsVO } from '../taskboard-module/integrate-application/integrate-application.vo';
import { OauthConfigCreator } from './oauth-config-creator';
@Injectable({
  providedIn: 'root',
})
export class YoroflowOAuthConfigService {
  private getOrganizationAppsUrl =
    environment.workflowBaseurl + '/org-apps/v1/get/apps';
  nonceStateSeparator = 'semicolon';
  private oauthConfigCreator: OauthConfigCreator;

  constructor(private http: HttpClient) {
    this.oauthConfigCreator = new OauthConfigCreator();
  }

  getApplicationConfig(appId: string, token: string): Observable<AuthConfig> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token
      })
    };
    return this.http
      .get<OrganizationIntegratedAppsVO[]>(
        this.getOrganizationAppsUrl, httpOptions
      )
      .pipe(
        map((appVos: OrganizationIntegratedAppsVO[]) => {
          return this.createAuthConfig(appVos, appId);
        })
      );
  }

  private createAuthConfig(appConfigs: OrganizationIntegratedAppsVO[], appId: string): AuthConfig {
    const selectConfig = appConfigs?.find(
      (appConfig) => appConfig?.id === appId
    );
    // if (window.location.href.includes('begin-board')) {
    //   selectConfig.redirectUrl = selectConfig.redirectUrl + '-board';
    // }
    return this.oauthConfigCreator.createAuthConfig(selectConfig);
  }
}
