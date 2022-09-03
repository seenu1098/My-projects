import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private getGroupsListUrl = environment.creationBaseUrl + '/group/v1/get/groups';
  private getWorkspaceNamesListUrl = environment.creationBaseUrl + '/workspace/v1/get/all/workspace-name-list';
  private getYoroDocsNamesListUrl = environment.workflowBaseurl + '/yoro-docs/v1/all-docs-name-list';
  constructor(private http: HttpClient) { }


  getTeamList() {
    return this.http.get<any[]>(this.getGroupsListUrl);
  }

  getWorkspaceNamesList() {
    return this.http.get<any>(this.getWorkspaceNamesListUrl);
  }

  getYoroDocsList() {
    return this.http.get<any>(this.getYoroDocsNamesListUrl);
  }
}
