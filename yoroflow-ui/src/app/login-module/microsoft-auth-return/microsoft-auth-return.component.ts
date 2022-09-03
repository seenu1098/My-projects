import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { filter } from 'rxjs/operators';
import { YoroflowOAuthService } from 'src/app/oauth-module/oauth.service';
import { MicrosoftLoginDetails } from '../login-vo';
import { MicrosoftAuthReturnService } from './microsoft-auth-return.service';

@Component({
  selector: 'app-microsoft-auth-return',
  templateUrl: './microsoft-auth-return.component.html',
  styleUrls: ['./microsoft-auth-return.component.scss']
})
export class MicrosoftAuthReturnComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute, private router: Router,
    private microsoftAuthReturnService: MicrosoftAuthReturnService, public oauthService: OAuthService) {
    const authConfig = {
      issuer: 'https://login.microsoftonline.com/common/v2.0/',
      loginUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      redirectUri: 'http://localhost:4200/microsoft-return',
      clientId: 'ea0e7f19-334e-42a0-be77-120ad6619853',
      responseType: 'code',
      scope: 'openid profile email offline_access',
      showDebugInformation: true,
      timeoutFactor: 0.01,
      strictDiscoveryDocumentValidation: false,
      skipIssuerCheck: true,
    }
    this.oauthService.configure(authConfig);
    this.oauthService.loadDiscoveryDocumentAndLogin();
    // window.close();
  }

  token: any;
  twoFactor: boolean;
  subDomain: string;
  code: any;

  ngOnInit(): void {
    if (window.location.href.includes('yoroflow.com')) {
      const arrOfStr = window.location.href.split('//', 2);
      const URL = arrOfStr[1].split('.', 2);
      this.subDomain = ' ' + URL[0];
    }
    this.code = this.activatedRoute.snapshot.queryParams.code as string;
    this.twoFactor = this.activatedRoute.snapshot.queryParams.twoFactor;
    this.token = this.activatedRoute.snapshot.queryParams.token;
    // this.goSignup();
    // setInterval(() => {
    // });
    // this.oauthService.events
    //   .pipe(filter((e) => e.type === 'token_received'))
    //   .subscribe((_) => {
    //     this.oauthService.loadUserProfile();
        const token = this.oauthService.getAccessToken();
        const userDetails = JSON.stringify(this.oauthService.getAccessToken());
        // window.location.href = `http://localhost:4201/microsoft?token=${token}&userDetails=${userDetails}`
      // });
  }

  goSignup() {
    if (this.token !== null) {
      const microsoftLoginDetails = new MicrosoftLoginDetails();
      microsoftLoginDetails.hasTwofactor = this.twoFactor;
      microsoftLoginDetails.microsoftLoginInProcess = true;
      microsoftLoginDetails.subdomain = this.subDomain;
      this.microsoftAuthReturnService.setMicrosoftTokenDetails(microsoftLoginDetails, this.token);
      // localStorage.setItem('microsoftLoginDetails', JSON.stringify(microsoftLoginDetails));
      // localStorage.setItem('microsoftTokenDetails', this.token);
    }
    this.router.navigate(['login']);
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
