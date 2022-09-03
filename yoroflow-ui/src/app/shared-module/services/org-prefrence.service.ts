import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TokenHeaderService } from './token-header.service';

@Injectable({
  providedIn: 'root'
})
export class OrgPrefrenceService {

  constructor(private http: HttpClient, private tokenHeaderService: TokenHeaderService) { }
  orgPreferences: any;

  getDefaultPageSizeUrl = environment.creationBaseUrl + '/org-prefrences/v1/get/org/page-size';

  getDefaultPageDetails() {
    this.orgPreferences = this.http.get<any>(this.getDefaultPageSizeUrl, this.tokenHeaderService.getHeader());
  }
}
  