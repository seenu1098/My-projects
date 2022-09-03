import { Component, OnInit } from '@angular/core';
import { UserService } from './rendering-module/shared/service/user-service';
import { CacheService } from './rendering-module/shared/service/cache.service';
import { CreationCacheService } from './creation-module/shared/service/creation-cache.service';
// import { UserService } from 'yoroapps-rendering-lib';
import { Router, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
// import { CacheService } from 'yoroapps-rendering-lib';
// import { CreationCacheService } from 'yoroapps-creation';
import { interval } from 'rxjs/internal/observable/interval';
import { StompClientService } from './message-module/stomp-client.service';
import { MicrosoftAuthenticationService } from './login-module/microsoft-authentication.service';
import { GuidedTour, GuidedTourService, Orientation } from 'ngx-guided-tour';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
 
  constructor(public userService: UserService, private router: Router, private client: StompClientService,
    private cacheService: CacheService, private creationService: CreationCacheService,
    private authService: MicrosoftAuthenticationService) {
     }
  title = 'yflow';
  urlValue: any;
  isPublic = false;
  isRoute = false;
  ngOnInit() {
    if (localStorage.getItem('token') === undefined || localStorage.getItem('token') === null || localStorage.getItem('token') === '') {
      this.isRoute = false;
    } else {
      this.isRoute = true;
    }
    if (
      !window.location.href.includes('/public/') &&
      !window.location.href.includes('/app/') &&
      !window.location.href.includes('/board/') &&
      !window.location.href.includes('/single-signon')
      &&
      !window.location.href.includes('/domain')
      &&
      !window.location.href.includes('/microsoft')
      &&
      !window.location.href.includes('/microsoft-return')
      &&
      !window.location.href.includes('/microsoft-azure')
    ) {
      this.isPublic = false;
      if (!this.userService.loggedIn()) {
        localStorage.setItem('currentWorkspace', 'default-workspace');
        localStorage.setItem('translate_lang', 'en');
        const arrOfStr = window.location.href.split('//', 2);
        const urls = arrOfStr[1].split('/', 3);
        const URL = arrOfStr[1].split('.', 2);
        if (urls && urls.length > 2 && URL && URL.length > 0 && !window.location.pathname?.includes('/login')) {
          localStorage.setItem('redirectSubdomainName', URL[0]);
          localStorage.setItem('lastRedirectUrl', window.location.pathname?.substring(3));
        }
        this.router.navigate(['login']);
      } 
      // else if (
      //   localStorage.getItem('authType') &&
      //   localStorage.getItem('authType') === 'Microsoft'
      // ) {
      //   this.getSilentToken();
      // } 
      else {
        try {
          this.client.initializeWebSocketConnection();
        } catch (error) {
          console.error('error initializing sockets');
        }
        this.authService.getRouteUrl();
      }
    } else if (
      !window.location.href.includes('/microsoft-return')) {
      this.isPublic = true;
    }
    this.clearCache();
  }

  getSilentToken() {
    this.authService.getSilentToken(true);
  }

  removeTokens() {
    if (localStorage.getItem('token') !== undefined) {
      localStorage.removeItem('token');
      localStorage.removeItem('authType');
    }
  }

  clearCache() {
    interval(600000)
      .subscribe((val) => { this.cacheService.responseCache.clear(); this.creationService.responseCache.clear(); });
  }
}
