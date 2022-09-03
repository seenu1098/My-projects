import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenHeaderService } from '../../shared-module/services/token-header.service';
import { ResponseString } from '../shared/vo/response-vo';
import { CustomerVO, customMenuVO, discountDetailsVO, EmailSettingsVOList, OrganizationSMSKeys, SubscriptionVO, updateCustomerVO } from './customer-vo';
import { environment } from '../../../environments/environment';
import { AllowAuthentication, CustomAttributeVO, TwoFactorAuthentication } from '../org-custom-attributes/org-custom-attribute-vo';

@Injectable({
  providedIn: 'root'
})
export class CreateOrganizationService {
  createOrganizationUrl = environment.creationBaseUrl + '/customer/v1/create';
  getOrganizationInfoUrl = environment.creationBaseUrl + '/customer/v1/get';
  getOrganizationUsingInvitationUrl = environment.creationBaseUrl + '/signup-service/v1/get/by/invitation-code/';
  checkSubdomainNameUrl = environment.creationBaseUrl + '/customer/v1/check-subdomain-name';
  getOrganizationLogoUrl = environment.creationBaseUrl + '/customer/v1/get/logo';
  getOrganizationThemeUrl = environment.creationBaseUrl + '/customer/v1/get/theme';
  getOrganizationInfoByIdUrl = environment.creationBaseUrl + '/customer/v1/get/customer/info/';
  getOrganizationPreferncesUrl = environment.creationBaseUrl + '/org-prefrences/v1/get/';
  getOrganizationTwoFactorUrl = environment.creationBaseUrl + '/two-factor/v1/get/';
  getOrganizationEmailSettingsUrl = environment.creationBaseUrl + '/email-setting/v1/get/';
  getUpdateOrganizationPreferncesUrl = environment.creationBaseUrl + '/org-prefrences/v1/get/org/';
  getUpdateOrganizationTwoFactorUrl = environment.creationBaseUrl + '/two-factor/v1/get/org/';
  getMenuListUrl = environment.renderingBaseUrl + '/menu/v1/get-org-menu-list';
  private getCustomMenuUrl = environment.creationBaseUrl + '/org-custom-menu/v1/get/org/';
  private getUpdateOrgCustomMenuUrl = environment.creationBaseUrl + '/org-custom-menu/v1/get/';
  private getOrganizationSmsKeysUrl = environment.creationBaseUrl + '/sms-keys/v1/get/';
  private getUpdateOrganizationSmsKeysUrl = environment.creationBaseUrl + '/sms-keys/v1/get/org/';
  private saveOrganizationSmsKeysUrl = environment.creationBaseUrl + '/sms-keys/v1/save-keys';
  private updateOrganizationurl = environment.creationBaseUrl + '/customer/v1/update';
  private updateTwoFactorUrl = environment.creationBaseUrl + '/two-factor/v1/update';
  private updateEmailSettingsUrl = environment.creationBaseUrl + '/email-setting/v1/update';
  private updateMobileMenuPreferencesUrl = environment.creationBaseUrl + '/org-custom-menu/v1/update';
  private updateSmsKeysUrl = environment.creationBaseUrl + '/sms-keys/v1/update';
  private updateAttributesUrl = environment.creationBaseUrl + '/org-custom-attributes/v1/update';
  private getOrgSubscriptionUrl = environment.creationBaseUrl + '/org-sub/v1/get/org-details';
  private getPaymentSubscriptionDetailsUrl = environment.creationBaseUrl + '/subscription-details/v1/get-details';
  private updateSubcriptionUrl = environment.creationBaseUrl + '/org-sub/v1/update';
  private getAuthenticationDetailsUrlOrg = environment.creationBaseUrl + '/auth-method/v1/get/org/';
  private getAuthenticationDetailsUrl = environment.creationBaseUrl + '/auth-method/v1/get/';
  private updateAuthenticationDetailsUrl = environment.creationBaseUrl + '/auth-method/v1/update';
  private discountUrl = environment.creationBaseUrl + '/subscription-details/v1/get-details/discount-amount';
  private packageUrl = environment.creationBaseUrl + '/customer/v1/update-package-details';
  private updateDiscountUrl = environment.creationBaseUrl + '/customer/v1/update-discount';
  private isAllowedUrl = environment.creationBaseUrl + '/auth-method/v1/license/is-allowed';
  private downgradePlanUrl = environment.creationBaseUrl + '/customer/v1/downgrade-plan';
  private getPaymentDetailsUrl = environment.creationBaseUrl + '/customer/v1/get/payment-details/';
  private getGuestUsersCountUrl = environment.creationBaseUrl + '/user-service/v1/guest-users-count';
  private getAmountPerUserUrl = environment.creationBaseUrl + '/subscription-details/v1/get/amount-per-user';
  private getPackageDetailsUrl = environment.creationBaseUrl + '/subscription-details/v1/get-details-for-payment';
  private getPlanDetailsByCustomerUrl = environment.creationBaseUrl + '/subscription-details/v1/get/plan-details-list';
  private setFreePlanUrl = environment.creationBaseUrl + '/org-sub/v1/set-free-plan';
  constructor(private http: HttpClient, private tokenHeaderService: TokenHeaderService) { }

  createOrganization(organizationVo: CustomerVO) {
    return this.http.post<any>(this.createOrganizationUrl, organizationVo.logo);
  }
  updateOrganizationPackage(updateCustomerVO: updateCustomerVO) {
    return this.http.post<any>(this.packageUrl, updateCustomerVO.logo);
  }

  updateOrganizationDisount(updateCustomerVO: updateCustomerVO) {
    return this.http.post<any>(this.updateDiscountUrl, updateCustomerVO.logo);
  }
  discountDetails(organizationVo: discountDetailsVO) {
    return this.http.post<any>(this.discountUrl, organizationVo);
  }

  getCustomMenu(domain) {
    return this.http.get<any>(this.getCustomMenuUrl + domain);
  }

  getUpdateOrgCustomMenu(domain) {
    return this.http.get<any>(this.getUpdateOrgCustomMenuUrl + domain);
  }

  getOrganizationInfo() {
    return this.http.get<CustomerVO>(this.getOrganizationInfoUrl);
  }

  getOrganizationInfoById(id) {
    return this.http.get<CustomerVO>(this.getOrganizationInfoByIdUrl + id);
  }

  getOrganizationUsingInvitationCode(code: string) {
    return this.http.get<CustomerVO>(this.getOrganizationUsingInvitationUrl + code);
  }

  checkWithSubdomainName(customerVO) {
    return this.http.post<ResponseString>(this.checkSubdomainNameUrl, customerVO);
  }

  getOrganizationLogo() {
    return this.http.get<ResponseString>(this.getOrganizationLogoUrl);
  }

  getOrganizationTheme() {
    return this.http.get<ResponseString>(this.getOrganizationThemeUrl);
  }

  getOrganizationTwoFactor(subdomain) {
    return this.http.get<TwoFactorAuthentication>(this.getOrganizationTwoFactorUrl + subdomain);
  }

  getOrganizationEmailSettings(subdomain) {
    return this.http.get<EmailSettingsVOList>(this.getOrganizationEmailSettingsUrl + subdomain);
  }

  getMenuList(menuNameList) {
    return this.http.post<any>(this.getMenuListUrl, menuNameList);
  }

  getOrganizationSmsKeys(subdomain) {
    return this.http.get<any>(this.getUpdateOrganizationSmsKeysUrl + subdomain);
  }

  getUpdateOrganizationSmsKeys(subdomain) {
    return this.http.get<any>(this.getOrganizationSmsKeysUrl + subdomain);
  }

  saveOrganizationSmsKeys(organizationSMSKeys: OrganizationSMSKeys) {
    return this.http.post<any>(this.saveOrganizationSmsKeysUrl, organizationSMSKeys);
  }

  updateOrganization(updateCustomerVO: updateCustomerVO) {
    return this.http.post<any>(this.updateOrganizationurl, updateCustomerVO.logo);
  }


  updateOrganizationTwoFactor(twoFactor: TwoFactorAuthentication) {
    return this.http.post<any>(this.updateTwoFactorUrl, twoFactor);
  }

  updateOrganizationEmailSettings(emailSettingsVo: EmailSettingsVOList) {
    return this.http.post<any>(this.updateEmailSettingsUrl, emailSettingsVo);
  }

  updateMobileMenuPrferences(customMenu: customMenuVO) {
    return this.http.post<any>(this.updateMobileMenuPreferencesUrl, customMenu);
  }

  updateSmsKeys(smsKeys: OrganizationSMSKeys) {
    return this.http.post<any>(this.updateSmsKeysUrl, smsKeys);
  }

  updateAttributes(attributes: CustomAttributeVO) {
    return this.http.post<any>(this.updateAttributesUrl, attributes);
  }

  updateTwoFactor(twoFactor: TwoFactorAuthentication) {
    return this.http.post<any>(this.updateTwoFactorUrl, twoFactor);
  }

  getOrgSubscription() {
    return this.http.get<any>(this.getOrgSubscriptionUrl);
  }

  getPaymentSubscriptionDetails() {
    return this.http.get<any>(this.getPaymentSubscriptionDetailsUrl);
  }

  updateSubcription(subcriptionVO: SubscriptionVO) {
    return this.http.post<any>(this.updateSubcriptionUrl, subcriptionVO);
  }

  getUpdateOrgPreference(subdomainName) {
    return this.http.get<any>(this.getUpdateOrganizationPreferncesUrl + subdomainName);
  }

  getUpdateOrgTwoFactor(subdomainName) {
    return this.http.get<any>(this.getUpdateOrganizationTwoFactorUrl + subdomainName);
  }

  getAuthenticationDetailsOrg(subdomain) {
    return this.http.get<any>(this.getAuthenticationDetailsUrlOrg + subdomain);
  }

  getAuthenticationDetails(subdomain) {
    return this.http.get<any>(this.getAuthenticationDetailsUrl + subdomain);
  }

  updateAuthMethod(allowAuthentication: AllowAuthentication) {
    return this.http.post<any>(this.updateAuthenticationDetailsUrl, allowAuthentication);
  }

  isAllowed() {
    return this.http.get<any>(this.isAllowedUrl);
  }

  downgradePlan(customerPaymentVo) {
    return this.http.post<any>(this.downgradePlanUrl, customerPaymentVo);
  }

  getPaymentDetails(paymentCustomerId) {
    return this.http.get<any>(this.getPaymentDetailsUrl + paymentCustomerId);
  }

  getGuestUsersCount() {
    return this.http.get<any>(this.getGuestUsersCountUrl);
  }

  getAmountPerUser(customerVo) {
    return this.http.post<any>(this.getAmountPerUserUrl, customerVo);
  }

  getPackageDetails() {
    return this.http.get<any>(this.getPackageDetailsUrl);
  }

  getPlanDetailsByCustomer(customerVO) {
    return this.http.post<any>(this.getPlanDetailsByCustomerUrl, customerVO);
  }

  setFreePlan(subcriptionVO: SubscriptionVO) {
    return this.http.post<any>(this.setFreePlanUrl, subcriptionVO);
  }

}
