import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Page } from '../shared/vo/page-vo';
import { TokenHeaderService } from '../../shared-module/services/token-header.service';
import { WorkFlowList } from '../shared/vo/workflow-list-vo';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Injectable({
  providedIn: 'root'
})
export class ApiKeyService {

  constructor(private http: HttpClient, private tokenHeaderService: TokenHeaderService, private workspaceService:WorkspaceService) { }
  getApiKeyUrl = environment.creationBaseUrl + '/user-service/v1/get/apikeys/';
  generateSecretKeyUrl = environment.creationBaseUrl + '/user-service/v1/generate/secretkey/apikey/';
  saveApiKeysUrl = environment.creationBaseUrl + '/user-service/v1/save/apikeys';
  getPageNamesForLoggedInUserUrl = environment.creationBaseUrl + '/page/v1/get/logged-in/page-names/';
  private listWorkflowUrl = environment.workflowBaseurl + '/flow/v1/get/workflow-list/api-key/';
  private deleteApiKeyUrl = environment.creationBaseUrl + '/user-service/v1/delete/apikey/';
  getApiKeyList(id) {
    return this.http.get<any>(this.getApiKeyUrl + id);
  }

  generateSecretKey(apiKey) {
    return this.http.get<any>(this.generateSecretKeyUrl + apiKey);
  }

  saveApiKeyList(apiKeyList) {
    return this.http.post<any>(this.saveApiKeysUrl, apiKeyList);
  }

  getAutoCompletePageNameForLoggedInUser() {
    return this.http.get<Page[]>(this.getPageNamesForLoggedInUserUrl+this.workspaceService.workspaceID, this.tokenHeaderService.getHeader());
  }

  getWorkFlowList() {
    return this.http.get<WorkFlowList[]>(this.listWorkflowUrl+this.workspaceService.workspaceID);
  }

  deleteApiKey(id) {
    return this.http.get<any>(this.deleteApiKeyUrl + id);
  }
}
