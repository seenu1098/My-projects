import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DataTableColumnsVO, DataTableVO } from '../automation-data-table/data-table-model';

@Injectable({
  providedIn: 'root'
})
export class AutomationServiceService {

  constructor(private http: HttpClient) { }

  private getSlackChannelsUrl = environment.automationBaseUrl + '/app/v1/slack/get-channels/';
  private getTeamsChannelUrl = environment.automationBaseUrl + '/app/v1/teams/get-channels/';
  private getEmailServersUrl = environment.creationBaseUrl + '/email-setting/v1/get/email-setting';

  private getInBuildVariableUrl = environment.workflowBaseurl + '/event-automation/v1/get/fields/for/page/sub-section/';
  private getPageFieldsUrl = environment.creationBaseUrl + '/dynamic-page/v1/get/fields/for/page/sub-section/';
  private getPageFieldsByTaskboardUrl = environment.workflowBaseurl + '/event-automation/v1/get/page-fields/';

  private getDataTableListUrl = environment.workflowBaseurl + '/flow/v1/get/table-names';
  private getDataTableColumnsUrl = environment.workflowBaseurl + '/flow/v1/get/field-names/';
  private getDataTablePageFieldsUrl = environment.workflowBaseurl + '/taskboard/v1/get-initial-fields/automation/';

  public getPageFields(formId: string, version: number): Observable<any> {
    return this.http.get<any>(this.getPageFieldsUrl + formId + '/' + version);
  }

  public getSystemVariables(formId: string, version: number): Observable<any> {
    return this.http.get<any>(this.getInBuildVariableUrl + formId + '/' + version);
  }

  public getPageFieldsByTaskboard(taskboardId: string): Observable<any> {
    return this.http.get<any>(this.getPageFieldsByTaskboardUrl + taskboardId);
  }

  public getSlackChannels(id: string): Observable<any> {
    return this.http.get<any>(this.getSlackChannelsUrl + id);
  }

  public getTeamsChannels(id: string): Observable<any> {
    return this.http.get<any>(this.getTeamsChannelUrl + id);
  }

  public getEmailServers(): Observable<any> {
    return this.http.get<any>(this.getEmailServersUrl);
  }

  public getDataTables(): Observable<DataTableVO[]> {
    return this.http.get<any>(this.getDataTableListUrl);
  }

  public getDataTableColumns(dataTableId: string): Observable<DataTableColumnsVO[]> {
    return this.http.get<any>(this.getDataTableColumnsUrl + dataTableId);
  }

  public getDataTablePageFields(formId: string, version: number):Observable<any>{
    return this.http.get<any>(this.getDataTablePageFieldsUrl + formId + '/' + version);
  }
}
