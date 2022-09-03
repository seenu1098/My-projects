import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class GenerateReportService {
  constructor(private http: HttpClient) { }

  private getCountUrl = environment.baseurl + '/reports/v1/get/total';
  private getUsersListUrl = environment.baseurl + '/reports/v1/get/users/list';
  private getTotalTaskReportUrl = environment.baseurl + '/reports/v1/get/total-task-reports';
  private getTotalCompletedTaskByUserUrl = environment.baseurl + '/reports/v1/get/total-completed-task-by-user';
  private getTotalAverageTimeUrl = environment.baseurl + '/reports/v1/get/total-average-time';

  getCount(vo) {
    return this.http.post<any>(this.getCountUrl, vo);
  }

  getTotalTaskReport(vo) {
    return this.http.post<any>(this.getTotalTaskReportUrl, vo);
  }

  getTotalCompletedTaskByUser(vo) {
    return this.http.post<any>(this.getTotalCompletedTaskByUserUrl, vo);
  }

  getTotalAverageTime(vo) {
    return this.http.post<any>(this.getTotalAverageTimeUrl, vo);
  }

  getUsersList() {
    return this.http.get<any>(this.getUsersListUrl);
  }
}
