import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { YoroGroups, Permission, TaskboardSecurityVO } from "./security.vo";
import { environment } from "../../../environments/environment";
import { ResponseString } from "src/app/creation-module/shared/vo/response-vo";

@Injectable({
  providedIn: "root",
})
export class SecurityService {
  constructor(private http: HttpClient) { }

  private renderingServiceUrl = environment.renderingBaseUrl;

  getGroupAutocompleteListUrl =
    this.renderingServiceUrl + "/page-security/v1/get-yorogroup-names/";
  savePagePermissionListUrl =
    this.renderingServiceUrl + "/page-security/v1/save/permission-list";

  getAccessForYoroGroupsUrl =
    environment.creationBaseUrl + "/page-security/v1/get-access-for-group/";
  checkGroupExistUrl =
    environment.creationBaseUrl + "/page-security/v1/check-group-exist/";

  saveTaskboardSecurityUrl =
    environment.workflowBaseurl + "/taskboard/v1/save/taskboard-security";

  getTaskboardSecurityUrl = environment.workflowBaseurl + "/taskboard/v1/get/taskboard-security/";

  saveTaskboardOwnersUrl = environment.workflowBaseurl + "/taskboard/v1/save/taskboard-owners";

  saveTaskboardColumnSecurityUrl = environment.workflowBaseurl + "/taskboard/v1/save/taskboard-column-security";

  getGroupNames(groupName: string) {
    return this.http.get<YoroGroups[]>(
      this.getGroupAutocompleteListUrl + groupName
    );
  }
  saveTaskboardSecurity(taskboardSecurityData: TaskboardSecurityVO) {
    return this.http.post<ResponseString>(
      this.saveTaskboardSecurityUrl,
      taskboardSecurityData
    );
  }



  getAccessForYoroGroups(groupId, pageId) {
    return this.http.get<ResponseString>(
      this.getAccessForYoroGroupsUrl + groupId + "/" + pageId
    );
  }

  checkGroupExistOrNot(id) {
    return this.http.get<ResponseString>(this.checkGroupExistUrl + id);
  }

  getTaskboardSecurity(id: string) {
    return this.http.get<any>(this.getTaskboardSecurityUrl + id);
  }

  saveTaskboardOwners(taskboardSecurityData: TaskboardSecurityVO) {
    return this.http.post<ResponseString>(
      this.saveTaskboardOwnersUrl,
      taskboardSecurityData
    );
  }

  saveTaskboardColumnSecurity(taskboardSecurityData: TaskboardSecurityVO) {
    return this.http.post<ResponseString>(this.saveTaskboardColumnSecurityUrl, taskboardSecurityData);
  }

}
