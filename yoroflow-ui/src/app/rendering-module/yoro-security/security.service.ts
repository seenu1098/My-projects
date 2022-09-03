import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ResponseString } from '../shared/vo/response-vo';
import { YoroGroups, Permission } from './security-vo';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  constructor(private http: HttpClient) { }

  getGroupAutocompleteListUrl = environment.renderingBaseUrl + '/page-security/v1/get-yorogroup-names/';
  savePagePermissionsUrl = environment.renderingBaseUrl + '/page-security/v1/save';
  getPagePermissionsUrl = environment.renderingBaseUrl + '/page-security/v1/get/';

  getApplicationPermissionUrl = environment.renderingBaseUrl + '/application-security/v1/get/';
  saveApplicationPermissionUrl = environment.renderingBaseUrl + '/application-security/v1/save';

  getAccessForYoroGroupsUrl = environment.renderingBaseUrl + '/page-security/v1/get-access-for-group/';
  checkGroupExistUrl = environment.renderingBaseUrl + '/page-security/v1/check-group-exist/';

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
