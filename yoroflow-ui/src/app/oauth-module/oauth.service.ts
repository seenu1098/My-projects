import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthConfig, JwksValidationHandler, NullValidationHandler, OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { OrganizationIntegratedAppsVO } from '../taskboard-module/integrate-application/integrate-application.vo';
import { authConfig } from './auth-config-model';
import { YoroflowOAuthConfigService } from './oauth-config.service';

@Injectable({
  providedIn: 'root',
})
export class YoroflowOAuthService {
  private saveOrganizationAppsUrl = environment.workflowBaseurl + '/org-apps/v1/save';
  private saveTaskboardAppsUrl = environment.workflowBaseurl + '/app-config/v1/save';
  private getOauthUrl = environment.workflowBaseurl + '/org-apps/v1/get/oauth-url';


  constructor(
    private yoroOauthConfigService: YoroflowOAuthConfigService,
    private oauthService: OAuthService,
    private httpClient: HttpClient
  ) { }

  private configure(authConfig: AuthConfig) {
    this.oauthService.configure(authConfig);
    this.oauthService.tokenValidationHandler = new NullValidationHandler();
    this.oauthService.tryLogin();
  }

  public initiateOAuthFlow(domain: string, provider: string, token: string, taskboardId: string,
    fromLogin: boolean, clientId: string): void {
    if (fromLogin === false) {
      this.yoroOauthConfigService
        .getApplicationConfig(provider, token).subscribe((authConfig) => {
          this.configure(authConfig);
          let configuredFrom: string;
          if (window.location.href.includes('begin-board')) {
            configuredFrom = 'taskboard';
          } else {
            configuredFrom = 'userLevel';
          }
          const oauthState = `{"domain": "${domain}", "provider": "${provider}" ,"from":"${configuredFrom}" , "taskboardId":"${taskboardId}"}`;
          this.oauthService.initLoginFlow(oauthState);
        });
    } else {
      if (clientId !== null && clientId !== 'null') {
        const redirectUri = domain + '/en/microsoft-azure';
        // const redirectUri = `'https://auth.yoroflow.com' + environment.externalProvidersIntegrationUrl + '/return'`;
        this.oauth(domain, redirectUri, clientId);
      } else {
        this.httpClient.get<any>(this.getOauthUrl).subscribe(data => {
          const redirectUri = data.response + '/return';
          this.oauth(domain, redirectUri, clientId);
        },
          error => {
            const redirectUri = `'https://auth.yoroflow.com' + environment.externalProvidersIntegrationUrl + '/return'`;
            this.oauth(domain, redirectUri, clientId);
          });
      }
    }
  }

  oauth(domain: string, redirectUri: string, clientId: string): void {
    const config = authConfig;
    config.redirectUri = redirectUri;
    let loginType = 'microsoft';
    if (clientId !== null && clientId !== 'null') {
      config.clientId = clientId;
      loginType = 'azure';
    }
    this.oauthService.configure(config);
    const from = 'login';
    localStorage.setItem('state', JSON.stringify({ domain, from, loginType, clientId }));
    this.oauthService.loadDiscoveryDocumentAndLogin();
    this.oauthService.events
      .pipe(filter((e) => e.type === 'token_received'))
      .subscribe((_) => {
        this.oauthService.loadUserProfile();
      });
  }

  public logout(): void {
    this.oauthService.logOut();
  }

  public extractState(state: string): string {
    if (!state) {
      throw new Error(`state can't be falsy here`);
    }
    const stateExtracted = state.slice(
      state.indexOf(
        this.yoroOauthConfigService.nonceStateSeparator
      ) + this.yoroOauthConfigService.nonceStateSeparator.length
    );
    return stateExtracted;
  }

  public saveAppIntegration(
    authCode: string,
    appId: string,
    domain: string,
  ): Observable<OrganizationIntegratedAppsVO[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: domain,
      }),
    };
    return this.httpClient.put<OrganizationIntegratedAppsVO[]>(
      `${this.saveOrganizationAppsUrl}/${authCode}/${appId}`, {}, httpOptions);
  }

  public saveTaskboardAppIntegration(authCode: string, appId: string, tenantId: string, taskboardId: string):
    Observable<OrganizationIntegratedAppsVO[]> {
    return this.httpClient.put<OrganizationIntegratedAppsVO[]>(
      `${this.saveTaskboardAppsUrl}/${authCode}/${appId}/${tenantId}/${taskboardId}`, {}
    );
  }

  get userName(): string {
    const claims = this.oauthService.getIdentityClaims();

    return JSON.stringify(claims);
  }

  get idToken(): string {
    return this.oauthService.getIdToken();
  }

  get accessToken(): string {
    return this.oauthService.getAccessToken();
  }

}
