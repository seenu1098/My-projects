import { Injectable } from '@angular/core';
import { WorkspaceVO, AssignTeamVO } from './create-dialog-vo';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseString } from 'src/app/creation-module/shared/vo/response-vo';

@Injectable({
  providedIn: 'root'
})
export class CreateDialogService {

  private createWorkspaceURL = environment.creationBaseUrl + '/workspace/v1/save';
  private listAllWorkspaceURL = environment.creationBaseUrl + '/workspace/v1/get/workspace';
  private checkWorkspaceNameURL = environment.creationBaseUrl + '/workspace/v1/check/name/';
  private checkWorkspaceUniqueIdURL = environment.creationBaseUrl + '/workspace/v1/check/unique-name/';
  private defaultWorkspaceURL = environment.creationBaseUrl + '/workspace/v1/default-workspace/save/';
  private archiveWorkspaceURL = environment.creationBaseUrl + '/workspace/v1/archive-workspace/';
  private deleteWorkspaceURL = environment.creationBaseUrl + '/workspace/v1/delete-workspace/';
  private saveWorkSecurityURL = environment.creationBaseUrl + '/workspace/v1/workspace-security/save';
  private getDefaultWorkspaceUrl = environment.creationBaseUrl + '/workspace/v1/get/default/workspace';
  private getDefaultWorkspaceUrls = environment.creationBaseUrl + '/workspace/v1/get-workspace-unique/';
  private isAllowedUrl = environment.creationBaseUrl + '/workspace/v1/license/is-allowed';
  private  saveAvatarChanges=environment.creationBaseUrl +'/workspace/v1/save/workspace-avatar'
  constructor(private http: HttpClient) { }

  createWorkspace(workspaceVO: WorkspaceVO) {
    return this.http.post<any>(this.createWorkspaceURL, workspaceVO);
  }

  checkWorkspaceName(workspaceName) {
    return this.http.get<any>(this.checkWorkspaceNameURL + workspaceName);
  }

  checkWorkspaceUniqueId(workspaceName) {
    return this.http.get<any>(this.checkWorkspaceUniqueIdURL + workspaceName);
  }

  listAllWorkspaceList() {
    return this.http.get<any>(this.listAllWorkspaceURL);
  }

  setDefault(id) {
    return this.http.get<any>(this.defaultWorkspaceURL + id);

  }

  setWorkspaceArchive(id) {
    return this.http.get<any>(this.archiveWorkspaceURL + id);
  }

  deleteWorkspace(id) {
    return this.http.get<any>(this.deleteWorkspaceURL + id);
  }

  saveWorkspaceSecurity(assignTeamVO: AssignTeamVO) {
    return this.http.post<ResponseString>(this.saveWorkSecurityURL, assignTeamVO);
  }
  saveAvatar(workspaceVO: WorkspaceVO) {
    return this.http.post<any>(this.saveAvatarChanges, workspaceVO);
  }

  public getDefaultWorkspace(url): Observable<any> {
    if (url === 'default-workspace') {
      return this.http.get<any>(this.getDefaultWorkspaceUrl);
    } else {
      return this.http.get<any>(this.getDefaultWorkspaceUrls + url);
    }
  }

  isAllowed() {
    return this.http.get<any>(this.isAllowedUrl);
  }
}
