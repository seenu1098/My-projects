import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrgPrefrenceService {

  constructor(private http: HttpClient) { }

  getDefaultPageSizeUrl = environment.creationBaseUrl + '/org-prefrences/v1/get/org/page-size';

  getDefaultPageSize() {
    return this.http.get<any>(this.getDefaultPageSizeUrl);
  }
}
