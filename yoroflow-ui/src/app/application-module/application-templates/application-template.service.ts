import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApplicationTemplateVO } from './application-template-model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationTemplateService {

  constructor(private http: HttpClient) { }

  private applicationTemplateUrl = environment.creationBaseUrl + '/install-apps/v1/get-list';
  private listAllWorkspaceURL = environment.creationBaseUrl + '/workspace/v1/get/workspace';
  private saveAppUrl = environment.creationBaseUrl + '/install-apps/v1/save/';


  public getAllWorkspace() {
    return this.http.get<any>(this.listAllWorkspaceURL);
  }

  public getApplicationTemplates(): Observable<ApplicationTemplateVO[]> {
    return this.http.get<ApplicationTemplateVO[]>(this.applicationTemplateUrl);
  }

  public saveApplication(workspaceId: string, appId: string): Observable<any> {
    return this.http.get<any>(this.saveAppUrl+workspaceId+'/'+appId);
  }
}
