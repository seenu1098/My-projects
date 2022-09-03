import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ResponseString } from 'src/app/engine-module/shared/vo/reponse-vo';
import { Observable } from 'rxjs';
import { LaunchPermissionVo } from './launch-taskboard';

@Injectable({
  providedIn: 'root'
})
export class LaunchTaskboardService {

  constructor(private http: HttpClient) { }

  private saveLaunchPermissionUrl = environment.baseurl + '/taskboard-launch/v1/save';
  private getLaunchPermissionUrl = environment.baseurl + '/taskboard-launch/v1/get-permission/list/';

  public saveLaunchPermission(launchPermission: LaunchPermissionVo): Observable<ResponseString> {
    return this.http.post<ResponseString>(this.saveLaunchPermissionUrl, launchPermission);
  }

  public getLaunchPermission(taskboardId: any): Observable<LaunchPermissionVo> {
    return this.http.get<LaunchPermissionVo>(this.getLaunchPermissionUrl + taskboardId);
  }
}
