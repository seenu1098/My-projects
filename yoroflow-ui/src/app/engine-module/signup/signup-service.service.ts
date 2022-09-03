import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomerVO } from 'src/app/creation-module/create-organization/customer-vo';
import { TaskboardTaskVO } from 'src/app/taskboard-module/taskboard-form-details/taskboard-task-vo';
import { environment } from 'src/environments/environment';
import { ResponseString } from '../shared/vo/reponse-vo';
import { AccountDetailsVO } from './account-details-model';

@Injectable({
  providedIn: 'root'
})
export class SignupServiceService {

  private getTaskboardIdUrl = environment.workflowBaseurl + '/taskboard/v1/get/taskboard-by-key/';
  private saveTaskboardTaskUrl = environment.workflowBaseurl + '/taskboard/v1/save/taskboard-task';
  private getTaskByKeyUrl = environment.workflowBaseurl + '/taskboard/v1/get/taskboard-task/public/';
  private saveAccountDetailsUrl = environment.creationBaseUrl + '/account/v1/public/save';
  private checkSubdomainUrl = environment.creationBaseUrl + '/account/v1/public/check-subdomain/';
  private createAccountUrl = environment.creationBaseUrl + '/account/v1/public/create-account';
  private checkAccountUrl=environment.creationBaseUrl+'/account/v1/public/check-account';

  constructor(private http: HttpClient) { }

  public getTaskboardDetails(id: string): Observable<any> {
    return this.http.get<any>(this.getTaskboardIdUrl + id);
  }

  public saveTaskboardTask(taskBoardTaskVO: TaskboardTaskVO): Observable<any> {
    return this.http.post<any>(this.saveTaskboardTaskUrl, taskBoardTaskVO);
  }

  public getTaskboardTask(taskboardKey: string, taskId: string): Observable<TaskboardTaskVO> {
    return this.http.get<TaskboardTaskVO>(this.getTaskByKeyUrl + taskboardKey + '/' + taskId);
  }

  public saveAccountDetails(accountDetailsVO: AccountDetailsVO): Observable<ResponseString> {
    return this.http.post<ResponseString>(this.saveAccountDetailsUrl, accountDetailsVO);
  }

  public checkAccount(accountDetailsVO: AccountDetailsVO): Observable<ResponseString> {
    return this.http.post<ResponseString>(this.checkAccountUrl, accountDetailsVO);
  }

  public createAccount(accountDetailsVO: AccountDetailsVO): Observable<ResponseString> {
    return this.http.post<ResponseString>(this.createAccountUrl, accountDetailsVO);
  }
}
