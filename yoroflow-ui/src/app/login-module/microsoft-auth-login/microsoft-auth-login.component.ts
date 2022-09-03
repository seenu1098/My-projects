import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { GoogleAuthVo, MicrosoftLoginDetails } from '../login-vo';

@Component({
  selector: 'app-microsoft-auth-login',
  templateUrl: './microsoft-auth-login.component.html',
  styleUrls: ['./microsoft-auth-login.component.scss']
})
export class MicrosoftAuthLoginComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,private oauthService:OAuthService) { 
    }

  microsoftResponse: any;
  subDomain: string;
  twoFactor: boolean;
  token: any;

  ngOnInit(): void {
    // this.twoFactor = this.activatedRoute.snapshot.queryParams.twoFactor;
    // this.subDomain = this.activatedRoute.snapshot.queryParams.subDomain;

    // this.loadMicrosoftLogin();
    this.setMiscrosoftLoginDetails();
  }

  setMiscrosoftLoginDetails(): void {
    const googleAuth = new GoogleAuthVo();
    googleAuth.tokenId = this.activatedRoute.snapshot.queryParams.token;
    googleAuth.loginType = this.activatedRoute.snapshot.queryParams.loginType;
    const userDetails = JSON.parse(this.activatedRoute.snapshot.queryParams.userDetails);
    googleAuth.email = userDetails.email;
    googleAuth.isSilentToken = false;
    localStorage.setItem('userDetails', JSON.stringify(googleAuth));
    window.close();
  }

}
