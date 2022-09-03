import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OrganizationVO } from './organization-vo';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  createOrganizationUrl = environment.creationBaseUrl + '/organization/v1/update';
  getOrganizationInfoUrl = environment.creationBaseUrl + '/organization/v1/get';
  getOrganizationPreferncesUrlForOrg = environment.creationBaseUrl + '/org-prefrences/v1/get/org/';
  getOrganizationTwoFactorUrlForOrg = environment.creationBaseUrl + '/two-factor/v1/get/org/';
  getMenuListUrl = environment.renderingBaseUrl + '/menu/v1/get-org-menu-list';
  private getCustomMenuUrl = environment.creationBaseUrl + '/org-custom-menu/v1/get/org/';
  private getSMSKeysUrl = environment.creationBaseUrl + '/sms-keys/v1/get/org/';
  private getOrgSubscriptionUrl = environment.creationBaseUrl + '/org-sub/v1/get/';
  private saveOrgSubscriptionUrl = environment.creationBaseUrl + '/org-sub/v1/save';
  private getPaymentSubscriptionDetailsUrl = environment.creationBaseUrl + '/subscription-details/v1/get-details';
  private isAllowedUrl = environment.creationBaseUrl + '/auth-method/v1/license/is-allowed';

  constructor(private http: HttpClient) { }
  createOrganization(organizationVo: OrganizationVO, type) {
    if (type === 'autoSubscription') {
      return this.http.post<any>(this.saveOrgSubscriptionUrl, organizationVo.logo);
    } else {
      return this.http.post<any>(this.createOrganizationUrl, organizationVo.logo);
    }
  }

  getCustomMenu(domain) {
    return this.http.get<any>(this.getCustomMenuUrl + domain);
  }

  getOrganizationInfo() {
    return this.http.get<any>(this.getOrganizationInfoUrl);
  }

  getPreferencesorOrganization(subdomain) {
    return this.http.get<any>(this.getOrganizationPreferncesUrlForOrg + subdomain);
  }

  getTwoFactorOrganization(subdomain) {
    return this.http.get<any>(this.getOrganizationTwoFactorUrlForOrg + subdomain);
  }

  getMenuList(menuNameList) {
    return this.http.post<any>(this.getMenuListUrl, menuNameList);
  }

  getSMSKeys(subdomain) {
    return this.http.get<any>(this.getSMSKeysUrl + subdomain);
  }

  getOrgSubscription(customerId) {
    return this.http.get<any>(this.getOrgSubscriptionUrl + customerId);
  }

  getPaymentSubscriptionDetails() {
    return this.http.get<any>(this.getPaymentSubscriptionDetailsUrl);
  }

  isAllowed() {
    return this.http.get<any>(this.isAllowedUrl);
  }
}
