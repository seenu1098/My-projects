import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResponseString } from '../shared/vo/reponse-vo';
import { YoroGroups, Permission } from './security-vo';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  constructor(private http: HttpClient) { }

  getGroupAutocompleteListUrl = environment.baseurl + '/user-management/v1/get/group-names/';
  savePagePermissionsUrl = environment.baseurl + '/permissions/v1/save';
  getPagePermissionsUrl = environment.baseurl + '/permissions/v1/get/';

  getApplicationPermissionUrl = environment.baseurl + '/task-security/v1/get/';
  saveApplicationPermissionUrl = environment.baseurl + '/task-security/v1/save';

  getGroupNames(groupName: string) {
    return this.http.get<YoroGroups[]>(this.getGroupAutocompleteListUrl + groupName);
  }

  getWorkflowPermissions(id: string) {
    return this.http.get<Permission[]>(this.getPagePermissionsUrl + id);
  }

  getTaskPermissions(id: any) {
    return this.http.get<Permission[]>(this.getApplicationPermissionUrl + id);
  }

  saveWorkflowPermissions(permissions) {
    return this.http.post<ResponseString>(this.savePagePermissionsUrl, permissions);
  }

  saveTaskPermissions(permissions) {
    return this.http.post<ResponseString>(this.saveApplicationPermissionUrl, permissions);
  }
}
