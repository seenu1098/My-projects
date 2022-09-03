import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { GoogleAuthVo } from './login-vo';
import { UserService } from '../engine-module/shared/service/user-service';
import { OrgPrefrenceService } from '../shared-module/services/org-prefrence.service';
import { WorkspaceService } from '../workspace-module/create-dialog/workspace.service';

@Injectable({
  providedIn: 'root'
})
export class MicrosoftAuthenticationService {


  autoRenevMicrosoftToken: any;
  microsoftAccount: any;
  urlValue: any;
  timerInterval = 0;
  constructor( public service: UserService, private router: Router,
              private orgPrfrenceService: OrgPrefrenceService, private workspaceService: WorkspaceService) { }

  getMicrosoftTimer() {
    this.autoRenevMicrosoftToken = Observable.interval(this.timerInterval)
      .subscribe((val) => {
        if (localStorage.getItem('authType') && localStorage.getItem('authType') === 'Microsoft') {
          this.getSilentToken(false);
        }
        this.autoRenevMicrosoftToken.unsubscribe();
      });
  }

  getSilentToken(navigate: boolean) {
    var values: any;
    if (localStorage.getItem('microsoftToken')) {
      values = JSON.parse(localStorage.getItem('microsoftToken'));
      if (values !== null) {
        
      }
    }
  }
  getRouteUrl() {
    this.router.events.subscribe(data => {
      this.urlValue = data;
      if (this.urlValue.url === '/' || this.urlValue.url === '') {
        this.workspaceService.getDefaultWorksapce('fromLogin');
      }
    });
    this.orgPrfrenceService.getDefaultPageDetails();
  }

  getTimerValue(response) {
    const date1 = new Date(response.expiresOn);
    const startDate = new Date();
    this.timerInterval = (date1.getTime() - startDate.getTime()) - (2000 * 60);
    this.getMicrosoftTimer();
  }
}
