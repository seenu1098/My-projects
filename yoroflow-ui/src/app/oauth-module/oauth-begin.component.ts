import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthConfig, NullValidationHandler, OAuthService } from 'angular-oauth2-oidc';
import { filter } from 'rxjs/operators';
import { YoroflowOAuthService } from './oauth.service';

@Component({
  template: `<div class="container-fluid mt-2">
    <h1>Redirecting...</h1>
  </div>`,
})
export class YoroflowOAuthBeginComponent implements OnInit {
  constructor(
    private yoroflowOauthService: YoroflowOAuthService,
    private activatedRoute: ActivatedRoute, private oauthService: OAuthService
  ) { }

  ngOnInit(): void {
    const domain = this.activatedRoute.snapshot.queryParams.domain;
    const provider = this.activatedRoute.snapshot.queryParams.provider;
    const token = this.activatedRoute.snapshot.queryParams.token;
    let fromLogin = false;
    let clientId = null;
    if (this.activatedRoute.snapshot.queryParams.login) {
      fromLogin = true;
      if (this.activatedRoute.snapshot.queryParams.loginType) {
        clientId = this.activatedRoute.snapshot.queryParams.loginType;
      }
    }
    let taskboardId: string;
    if (this.activatedRoute.snapshot.queryParams.taskboardId) {
      taskboardId = this.activatedRoute.snapshot.queryParams.taskboardId;
    }
    this.yoroflowOauthService.initiateOAuthFlow(domain, provider, token, taskboardId, fromLogin, clientId);
  }
}
