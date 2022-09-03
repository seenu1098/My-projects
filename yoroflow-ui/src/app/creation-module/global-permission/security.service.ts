import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


import { YoroGroups, Permission } from './security-vo';
import { environment } from '../../../environments/environment';
import { ResponseString } from '../shared/vo/response-vo';


@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  constructor(private http: HttpClient) { }

  private renderingServiceUrl = environment.renderingBaseUrl;

  getGroupAutocompleteListUrl = this.renderingServiceUrl + '/page-security/v1/get-yorogroup-names/';
  savePagePermissionsUrl = this.renderingServiceUrl + '/page-security/v1/save';
  getPagePermissionsUrl = this.renderingServiceUrl + '/page-security/v1/get/';

  savePagePermissionListUrl = this.renderingServiceUrl + '/page-security/v1/save/permission-list';

  getApplicationPermissionUrl = environment.creationBaseUrl + '/application-security/v1/get/';
  saveApplicationPermissionUrl = environment.creationBaseUrl + '/application-security/v1/save';

  getCustomPagePermissionUrl = environment.renderingBaseUrl + '/custom-page-security/v1/get/';
  saveCustomPagePermissionUrl = environment.renderingBaseUrl + '/custom-page-security/v1/save';

  getAccessForYoroGroupsUrl = environment.creationBaseUrl + '/page-security/v1/get-access-for-group/';
  checkGroupExistUrl = environment.creationBaseUrl + '/page-security/v1/check-group-exist/';

  saveCustomPagePermissions(permissions) {
    return this.http.post<ResponseString>(this.saveCustomPagePermissionUrl, permissions);
  }

  getCustomPagePermissions(id: any) {
    return this.http.get<Permission[]>(this.getCustomPagePermissionUrl + id);
  }

  getGroupNames(groupName: string) {
    return this.http.get<YoroGroups[]>(this.getGroupAutocompleteListUrl + groupName);
  }

  getPagePermissions(id: string) {
    return this.http.get<Permission[]>(this.getPagePermissionsUrl + id);
  }

  getApplicationPermissions(id: any) {
    return this.http.get<Permission[]>(this.getApplicationPermissionUrl + id);
  }

  savePagePermissions(permissions) {
    return this.http.post<ResponseString>(this.savePagePermissionsUrl, permissions);
  }

  savePagePermissionsList(permissionsList) {
    return this.http.post<ResponseString>(this.savePagePermissionListUrl, permissionsList);
  }

  saveApplicationPermissions(permissions) {
    return this.http.post<ResponseString>(this.saveApplicationPermissionUrl, permissions);
  }

  getAccessForYoroGroups(groupId, pageId) {
    return this.http.get<ResponseString>(this.getAccessForYoroGroupsUrl + groupId + '/' + pageId);
  }

  checkGroupExistOrNot(id) {
    return this.http.get<ResponseString>(this.checkGroupExistUrl + id);
  }
}
