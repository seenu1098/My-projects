import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { CustomPageVo } from './custom-page-vo';
import { environment } from '../../../environments/environment';
import { ResponseString } from '../shared/vo/response-vo';

@Injectable({
  providedIn: 'root'
})
export class CustomPageService {

  constructor(private http: HttpClient) { }

  private saveCustomPageUrl = environment.creationBaseUrl + '/custom-page/v1/';
  private getCustomPageUrl = environment.creationBaseUrl + '/custom-page/v1/';

  save(customPageVo) {
    return this.http.post<ResponseString>(this.saveCustomPageUrl + 'save', customPageVo);
}

getCustomPageDetails(id) {
  return this.http.get<CustomPageVo>(this.getCustomPageUrl + 'get/' + id);
}
}
