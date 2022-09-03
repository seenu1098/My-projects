import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseString } from 'src/app/engine-module/shared/vo/reponse-vo';
import { environment } from 'src/environments/environment';
import { SprintSettings, SprintVO } from './sprint-model';

@Injectable({
  providedIn: 'root'
})
export class SprintService {

  private getSprintSettingsUrl = environment.baseurl + '';
  private saveSprintSettingsUrl = environment.baseurl + '/sprint/v1/save-sprint-setting';
  private saveSprintUrl = environment.baseurl + '/sprint/v1/save-sprint';
  private deleteSprintUrl = environment.baseurl + '/sprint/v1/delete-sprint-setting';
  private getInPreparationListUrl = environment.baseurl + '/sprint/v1/get/in-preparation-sprint/'

  constructor(private http: HttpClient) { }

  public getSprintSettings(): Observable<SprintSettings> {
    return this.http.get<SprintSettings>(this.getSprintSettingsUrl);
  }

  public saveSprintSettings(sprintSettings: SprintSettings): Observable<ResponseString> {
    return this.http.post<ResponseString>(this.saveSprintSettingsUrl, sprintSettings);
  }

  public saveSprint(sprintVo: SprintVO): Observable<any> {
    return this.http.post<any>(this.saveSprintUrl, sprintVo);
  }

  public getInPreparationSprint(taskboardId: string): Observable<SprintVO[]> {
    return this.http.get<SprintVO[]>(this.getInPreparationListUrl + taskboardId);
  }
}
