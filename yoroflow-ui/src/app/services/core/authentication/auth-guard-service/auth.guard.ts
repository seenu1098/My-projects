import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, RouterEvent } from '@angular/router';
import { UserService } from '../../../../engine-module/shared/service/user-service';
import { JwtHelperService } from '@auth0/angular-jwt';
import decode from 'jwt-decode';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  helper = new JwtHelperService();
  token = localStorage.getItem('token');
  urlValue: any;

  constructor(private service: UserService, private router: Router, private jwtHelper: JwtHelperService,
              private workspaceService: WorkspaceService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.router.events.subscribe(data => {
      this.urlValue = data;
      const tokenPayload = decode(this.token);
      if (!window.location.href.includes('localhost') && 
      !window.location.href.includes(tokenPayload.sub_domain) && !this.jwtHelper.isTokenExpired(localStorage.getItem('token'))) {
        window.location.href = 'https://' + tokenPayload.sub_domain + this.urlValue.url;
      }
    });
    if (localStorage.getItem('token') && !this.jwtHelper.isTokenExpired(localStorage.getItem('token'))) {
      return true;
    } else {
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
      }
    }
    const url: string = state.url;
    this.service.redirectUrl = url;
    this.workspaceService.setlastRedirectUrl(url);
    this.router.navigate(['/login']);
    return false;

  }
}
