import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { YoroDocumentVO, } from './documents-vo';
import { securityAssignVO, YoroGroups, commentsVO } from './documents-vo';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';
import { Observable } from 'rxjs';
import { UserVO } from '../taskboard-module/taskboard-form-details/taskboard-task-vo';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  private saveUrl = environment.workflowBaseurl + '/yoro-docs/v1/save/';
  private getUrl = environment.workflowBaseurl + '/yoro-docs/v1/get/all-docs/';
  private downloadFileUrl = environment.baseurl + "/yoro-docs/v1/download/docs/";
  private securityUrl = environment.baseurl + '/yoro-docs/v1/get/security/'
  private saveSecurityUrl = environment.baseurl + '/yoro-docs/v1/save-security'
  getGroupAutocompleteListUrl = environment.renderingBaseUrl + "/page-security/v1/get-yorogroup-names/";
  private deleteUrl = environment.workflowBaseurl + '/yoro-docs/v1/delete/';
  private getLoggedUserDetailsUrl = environment.messagingBaseUrl + '/user-service/v1/get/logged-in/user-details';
  private getSaveTeamUrl = environment.workflowBaseurl + '/yoro-docs/v1/save/team-security';
  private getUsersListUrl = environment.baseurl + '/user-service/v1/get/users';
  private getGroupListUrl = environment.baseurl + '/user-management/v1/get/list';
  private getTeamDetailsUrl = environment.workflowBaseurl + '/user-service/v1/get/user-details/';
  private saveDocCommentUrl = environment.workflowBaseurl + '/yoro-docs/v1/save/doc-comment';
  private getDocCommentUrl = environment.workflowBaseurl + '/yoro-docs/v1/get/doc-comment/';
  private isAllowedUrl = environment.workflowBaseurl + '/yoro-docs/v1/license/is-allowed';


  constructor(private http: HttpClient, private workspaceService: WorkspaceService) { }
  saveDocuments(YoroDocumentVO: FormData) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data',
      })
    };
    return this.http.post<any>(this.saveUrl + this.workspaceService.workspaceID, YoroDocumentVO);
  }
  getDocuments() {
    return this.http.get<any>(this.getUrl + this.workspaceService.workspaceID);
  }
  public downloadAttachedFile(documentId: string) {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        observe: 'response' as 'response'
      })
    };
    return this.http.get<any>(this.downloadFileUrl + documentId, httpOptions);
  }
  getSecurity(docId) {
    return this.http.get<any>(this.securityUrl + docId);
  }
  saveSecurity(securityAssignVO) {
    return this.http.post<any>(this.saveSecurityUrl, securityAssignVO);
  }
  getGroupNames(groupName: string) {
    return this.http.get<YoroGroups[]>(
      this.getGroupAutocompleteListUrl + groupName
    );
  }
  removeDocument(docId) {
    return this.http.get<any>(this.deleteUrl + docId);
  }
  getLoggedInUserDetails(): Observable<UserVO> {
    return this.http.get<UserVO>(this.getLoggedUserDetailsUrl);
  }
  saveTeam(teamVO) {
    return this.http.post<any>(this.getSaveTeamUrl, teamVO);
  }
  public getUsersList(): Observable<any> {
    return this.http.get<any>(this.getUsersListUrl);
  }
  public getUserGroupList(): Observable<any> {
    return this.http.get<any>(this.getGroupListUrl);
  }
  public getUserTeamDetails(id) {
    return this.http.get<any>(this.getTeamDetailsUrl + id);
  }
  public saveComments(commentsVO) {
    return this.http.post<any>(this.saveDocCommentUrl, commentsVO);

  }
  public getComments(id) {
    return this.http.get<any>(this.getDocCommentUrl + id);
  }

  public isAllowed() {
    return this.http.get<any>(this.isAllowedUrl);
  }
}

