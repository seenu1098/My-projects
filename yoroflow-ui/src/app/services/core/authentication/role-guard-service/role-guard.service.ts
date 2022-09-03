import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from '../auth-guard-service/auth.guard';
import decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardService implements CanActivate {

  constructor(public auth: AuthGuard, public router: Router) { }

  hasUserRole = false;

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // this will be passed from the route config
    // on the data property
    const expectedRoleList: any[] = route.data.expectedRole;
    const token = localStorage.getItem('token');
    // decode the token to get its payload
    const tokenPayload = decode(token);
    const expectedPathList: any[] = route.routeConfig.path.split('/');
    expectedPathList.forEach(expectedPath => {
      if (tokenPayload.user_role.some(userRole => userRole === expectedPath) && tokenPayload.isSubscriptionExpired === false) {
        this.hasUserRole = true;
      }
      // if (expectedPath.includes('taskboard') || expectedPath.includes('document')) {
      //   this.hasUserRole = true;
      // }
    });
    if (!this.hasUserRole) {
      this.router.navigate(['user-permission']);
      return false;
    }
    return true;
  }
}
