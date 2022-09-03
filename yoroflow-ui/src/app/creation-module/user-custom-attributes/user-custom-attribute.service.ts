import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserCustomAttributeService {

  constructor(private http: HttpClient) { }

  saveEnvironmentDetailsUrl = environment.creationBaseUrl + '/custom-attributes/v1/save';
  getEnvironmentDetailsUrl = environment.creationBaseUrl + '/custom-attributes/v1/get';
  getOrgCustomattributesUrl = environment.creationBaseUrl + '/org-custom-attributes/v1/get/';
  getOrgCustomattributesOrgUrl = environment.creationBaseUrl + '/org-custom-attributes/v1/get/org/';

  saveCustomattributesDetails(environmentVariableVO) {
    return this.http.post<any>(this.saveEnvironmentDetailsUrl, environmentVariableVO);
  }

  getCustomattributesDetails() {
    return this.http.get<any>(this.getEnvironmentDetailsUrl);
  }

  getOrgCustomattributesDetails(subdomain) {
    return this.http.get<any>(this.getOrgCustomattributesUrl + subdomain);
  }

  getOrgCustomattributesDetailsForOrganization(subdomain) {
    return this.http.get<any>(this.getOrgCustomattributesOrgUrl + subdomain);
  }


}
