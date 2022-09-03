import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserService } from '../service/user-service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  helper = new JwtHelperService();
  token = localStorage.getItem('token');


  constructor(private service: UserService, private router: Router) { }

  canActivate(): boolean {
    if (!this.service.loggedIn() || this.helper.isTokenExpired(this.token) || this.token == null) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;

  }

}
