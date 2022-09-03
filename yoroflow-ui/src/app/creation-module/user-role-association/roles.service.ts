import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RoleListVO, YoroGroupsUserVO } from './role-vo';
import { ResponseString } from '../../engine-module/shared/vo/reponse-vo';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  rolesUrl=environment.creationBaseUrl+'/user-role/v1/get-roles';
  getUserRoles=environment.creationBaseUrl+'/user-role/v1/get-user-roles/';
  saveRolesList=environment.creationBaseUrl;

  constructor(private http: HttpClient) { }
  getRolesList(){
      return this.http.get<RoleListVO>(this.rolesUrl);
 
  }
  getUserRoleList(id){
    return this.http.get<YoroGroupsUserVO>(this.getUserRoles+id);

  }
  saveRoles(roleVO){
      return this.http.post<ResponseString>(this.saveRolesList + '/user-role/v1/save',
      roleVO);
  }
  }

