import { state } from '@angular/animations';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { filter } from 'rxjs/operators';
import { authConfig } from './auth-config-model';
import { YoroflowOAuthService } from './oauth.service';

@Component({
  template: `<div class="container-fluid mt-2">
    <h1>Redirecting back...</h1>  
`,
})
export class YoroflowOAuthReturnComponent implements AfterViewInit {
  code: string;
  scope: string;
  domain: string;
  appId: string;
  taskboardId: string;
  fromLogin: boolean;
  loginType: string;
  clientId: string;

  constructor(
    private yoroflowOauthService: YoroflowOAuthService,
    private activatedRoute: ActivatedRoute, private oauthService: OAuthService
  ) {
    this.code = this.activatedRoute.snapshot.queryParams.code as string;
    this.scope = this.activatedRoute.snapshot.queryParams.scope as string;

    if (localStorage.getItem('state')) {
      const state = JSON.parse(localStorage.getItem('state'));
      this.domain = state.domain;
      this.fromLogin = true;
      this.loginType = state.loginType;
      this.clientId = state.clientId;
      localStorage.removeItem('state');
      const config = authConfig;
      if (window.location.href.includes('microsoft-azure')) {
        config.redirectUri = window.location.origin + '/en/microsoft-azure';
        config.clientId = this.clientId;
        this.oauthService.configure(config);
        this.oauthService.loadDiscoveryDocumentAndLogin();
      } else {
      config.redirectUri = window.location.origin + '/en/single-signon/return';
      this.oauthService.configure(config);
      this.oauthService.loadDiscoveryDocumentAndLogin();
    }
    } else {
      const oauthState = this.extractState(
        this.activatedRoute.snapshot.queryParams.state as string
      );
      this.appId = oauthState.provider;
      this.domain = decodeURIComponent(oauthState.domain);
      if (oauthState.from === 'taskboard') {
        this.taskboardId = oauthState.taskboardId;
      }
    }
  }

  ngOnInit(): void {
    if (this.fromLogin) {
      this.oauthService.events
        .pipe(filter((e) => e.type === 'token_received'))
        .subscribe((_) => {
          this.oauthService.loadUserProfile();
          const token = this.oauthService.getAccessToken();
          const userDetails = JSON.stringify(this.oauthService.getIdentityClaims());
          let loginType = 'microsoft';
          if (window.location.href.includes('microsoft-azure')) {
            loginType = 'azure';
          }
          // if (this.loginType === 'azure') {
          //   window.location.href = `https://india.yoroflow.com/en/microsoft?token=${token}&userDetails=${userDetails}&loginType=${this.loginType}`;
          // } else {
          window.location.href = this.domain + `/en/microsoft?token=${token}&userDetails=${userDetails}&loginType=${this.loginType}`;
          // }
        });
    }
  }

  ngAfterViewInit(): void {
    if (!this.fromLogin) {
      if (this.taskboardId) {
        this.yoroflowOauthService.saveTaskboardAppIntegration(this.code, this.appId, this.domain, this.taskboardId).subscribe(() => {
          setTimeout(() => {
            window.close();
          }, 3000);
        });
      } else {
        this.yoroflowOauthService.saveAppIntegration(this.code, this.appId, this.domain).subscribe(() => {
          window.close();
        });
      }
    }
  }

  private extractState(oauthState: string): { domain: string; provider: string; taskboardId: string; from: string } {
    return JSON.parse(
      decodeURIComponent(this.yoroflowOauthService.extractState(oauthState))
    );
  }
}
