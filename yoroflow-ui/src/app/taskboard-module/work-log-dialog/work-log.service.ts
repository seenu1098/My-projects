import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PaginationVO } from 'src/app/mytasks-module/mytasks/pagination-vo';
import { WorkLogVo } from './work-log-model';

@Injectable({
  providedIn: 'root'
})

export class WorkLogService {

  constructor(private http: HttpClient) { }

  private getWorklogListUrl = environment.baseurl + '/sprint/v1/get/work-log';
  private saveWorklogUrl = environment.baseurl + '/sprint/v1/save/work-log';
  private getRemainingHoursUrl = environment.baseurl + '/sprint/v1/get/remaining-hours/';

  getWorkList(paginationVO: PaginationVO) {
    return this.http.post<any>(this.getWorklogListUrl, paginationVO)
  }

  saveWorkLog(workLogVo: WorkLogVo) {
    return this.http.post<any>(this.saveWorklogUrl, workLogVo)
  }

  getRemainingHours(sprintTaskId: WorkLogVo) {
    return this.http.get<any>(this.getRemainingHoursUrl + sprintTaskId)
  }
}
