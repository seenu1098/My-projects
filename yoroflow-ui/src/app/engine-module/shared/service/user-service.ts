import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


import { Observable } from 'rxjs';
import { ResponseString } from '../vo/reponse-vo';
import { environment } from '../../../../environments/environment';
import { AuthToken } from '../../../login-module/auth-token';

// import { AuthToken } from '../../login/auth-token';
import { UserVO } from '../vo/user-vo';
// import { QrDetailsVo } from '../../login/login-vo';
import { QrDetailsVo, TermsConditionsVo } from '../../../login-module/login-vo';


@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private http: HttpClient) { }
    userAccess: boolean;
    url = environment.baseurl;
    public redirectUrl: string;
    customerTheme: any;
    otpVerified = false;
    hasTwoFactor = false;
    subDomain = "";

    getLoggedUserDetailsUrl = this.url + '/user-service/v1/get/logged-in/user-details';
    loginUrl = environment.authUrl + '/user-service/v1/authenticate';
    qrUrl = environment.authUrl + '/qr-service/v1/qr/setup/';
    validateOtpUrl = environment.authUrl + '/qr-service/v1/qr/validate-otp';
    loginForQrUrl = environment.authUrl + '/qr-service/v1/authenticate';
    checkQrUrl = environment.authUrl + '/qr-service/v1/check-qr';
    updatePasswordUrl = environment.creationBaseUrl + '/user-service/v1/change/password';
    getSubDomainUrl = environment.renderingBaseUrl + '/user-service/v1/get/sub-domain/';
    getLogo = environment.creationBaseUrl + '/customer/v1/get/customer-logo';
    checkCustomAttributeurl = this.url + '/org-custom-attribute/v1/check';
    loginByGoogleUrl = environment.authUrl + '/google-auth/v1/authenticate';
    loginByMicrosoftUrl = environment.authUrl + '/microsoft-auth/v1/authenticate/microsoft';
    checkEmailQrUrl = environment.authUrl + '/email-auth/v1/qr/setup';
    validateEmailQrUrl = environment.authUrl + '/email-auth/v1/qr/validate-otp';
    saveOrgTermsUrl = environment.authUrl + '/terms/v1/save';
    getToken() {
        return localStorage.getItem('token');
    }

    userLogin(login: any) {
        return this.http.post<AuthToken>(this.loginUrl, login);
    }

    userLoginForQr(login: any) {
        return this.http.post<any>(this.loginForQrUrl, login);
    }

    getQr(userId: string) {
        return this.http.get<any>(this.qrUrl + userId);
    }

    checkOtp(otpVo: QrDetailsVo) {
        return this.http.post<any>(this.validateOtpUrl, otpVo);
    }

    checkQr(userId: QrDetailsVo) {
        return this.http.post<any>(this.checkQrUrl, userId);
    }

    checkEmailQr(qrDetailsVo: QrDetailsVo) {
        return this.http.post<any>(this.checkEmailQrUrl, qrDetailsVo);
    }

    validateEmailQr(qrDetailsVo: QrDetailsVo) {
        return this.http.post<any>(this.validateEmailQrUrl, qrDetailsVo);
    }

    loggedIn() {
        if (localStorage.getItem('token') && localStorage.getItem('token') !== null
            && localStorage.getItem('token') !== '' && localStorage.getItem('token') !== 'null') {
            return true;
        }
        return false;
    }

    getRedirectUrl(): any {
        return this.redirectUrl;
    }

    getHeader() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: this.getToken()
            })
        };

        return httpOptions;
    }

    getLoggedInUserDetails(): Observable<UserVO> {
        return this.http.get<UserVO>(this.getLoggedUserDetailsUrl);
    }

    logout(): void {
        localStorage.removeItem('token');
    }

    getCustomerLogo() {
        return this.http.get<any>(this.getLogo);
    }

    changePassword(passwordVO) {
        return this.http.post<any>(this.updatePasswordUrl, passwordVO);
    }

    getSubDomain(tenantId) {
        return this.http.get<any>(this.getSubDomainUrl + tenantId);
    }

    checkCustomAttribute() {
        return this.http.get<any>(this.checkCustomAttributeurl);
    }

    checkGoogleUser(googleUser) {
        return this.http.post<any>(this.loginByGoogleUrl, googleUser);
    }

    checkMicrosoftUser(googleUser) {
        return this.http.post<any>(this.loginByMicrosoftUrl, googleUser);
    }

    saveValues(twoFactor, subDomain) {
        this.hasTwoFactor = twoFactor;
        this.subDomain = subDomain;
    }

    getValues() {
        return this.hasTwoFactor;
    }

    public acceptTerms(): Observable<ResponseString> {
        return this.http.get<ResponseString>(this.saveOrgTermsUrl);
    }

}
