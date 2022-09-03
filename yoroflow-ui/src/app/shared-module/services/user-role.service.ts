import { Injectable } from '@angular/core';
import decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {

  constructor() { }
  getUserRoles() {
    const token = localStorage.getItem('token');
    const tokenPayload = decode(token);
    return tokenPayload.associate_roles;
  }
}
