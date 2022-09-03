import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


import { Observable } from 'rxjs';
import { ResponseString } from '../vo/response-vo';
import { environment } from '../../../../environments/environment';
import { UserVO, RolesListVO } from '../vo/user-vo';
import { QrDetailsVo } from '../../../login-module/login-vo';


@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private http: HttpClient) { }
    userAccess: boolean;
    url = environment.creationBaseUrl;
    public redirectUrl: string;
    customerTheme: any;
    checkQrUrl = environment.authUrl + '/qr-service/v1/check-qr';
    getLoggedUserDetailsUrl = this.url + '/user-service/v1/get/logged-in/user-details';
    loginUrl = this.url + '/user-service/v1/authenticate';
    updatePasswordUrl = this.url + '/user-service/v1/change/password/user-management';
    signupUserUrl = this.url + '/signup-service/v1/invite/user';
    inviteUserUrl = this.url + '/user-service/v1/invite/user';
    updateRolesUrl = this.url + '/user-service/v1/update/user-management';

    getRolesNamesUrl = this.url + '/user-service/v1/get-role-name-list';
    getUserInfoUrl = this.url + '/user-service/v1/get-user-form/';
    deleteUserUrl = this.url + '/user-service/v1/delete/';
    getOrganizationThemeUrl = environment.creationBaseUrl + '/customer/v1/get/theme';
    saveUserProfileUrl = environment.creationBaseUrl + '/user-service/v1/save/user-profile';
    changePasswordUrl = environment.creationBaseUrl + '/user-service/v1/change/password';
    saveUserUrl = environment.creationBaseUrl + '/user-service/v1/save/user-management';
    getLoggedUserProfilePictureUrl = this.url + '/user-service/v1/get/logged-in/user-profile-picture';
    updateUserUrl = environment.creationBaseUrl + '/user-service/v1/update/user-management';
    resetTwoFactorAuthUrl = environment.creationBaseUrl + '/user-service/v1/reset/two-factor/';
    removeTwoFactorAuthUrl = environment.creationBaseUrl + '/user-service/v1/remove/two-factor/';
    checkEmailQrUrl = environment.authUrl + '/email-auth/v1/qr/setup';

    enableTwoFactorAuthUrl = environment.creationBaseUrl + '/user-service/v1/save/enable-two-factor';
    loginForQrUrl = environment.authUrl + '/qr-service/v1/authenticate';
    checkOtpUrl = environment.authUrl + '/qr-service/v1/qr/validate-otp';
    getTeamsCountUrl = environment.renderingBaseUrl + '/group/v1/get/teams-count';
    getToken() {
        return localStorage.getItem('token');
    }

    // userLogin(login: any) {
    //     return this.http.post<AuthToken>(this.loginUrl, login);
    // }

    loggedIn() {
        return !!this.getToken();
    }

    getRedirectUrl(): any {
        return this.redirectUrl;
    }

    signup(signupVo) {
        return this.http.post<ResponseString>(this.signupUserUrl, signupVo);
    }

    inviteUser(userVO) {
        return this.http.post<ResponseString>(this.inviteUserUrl, userVO);
    }

    resetTwoFactorAuth(userId) {
        return this.http.get<ResponseString>(this.resetTwoFactorAuthUrl + userId);
    }

    removeTwoFactorAuth(userId) {
        return this.http.get<ResponseString>(this.removeTwoFactorAuthUrl + userId);
    }

    enableTwoFactorAuth(enableTwoFactorVO) {
        return this.http.post<ResponseString>(this.enableTwoFactorAuthUrl, enableTwoFactorVO);
    }

    checkQr(userId: QrDetailsVo) {
        return this.http.post<any>(this.checkQrUrl, userId);
    }

    checkEmailQr(qrDetailsVo: QrDetailsVo) {
        return this.http.post<any>(this.checkEmailQrUrl, qrDetailsVo);
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
        localStorage.removeItem('role');
    }

    updatePassword(userVO) {
        return this.http.post<ResponseString>(this.updatePasswordUrl, userVO);
    }

    updateRoles(userVO) {
        return this.http.post<ResponseString>(this.updateRolesUrl, userVO);
    }

    getRolesNames() {
        return this.http.get<RolesListVO[]>(this.getRolesNamesUrl);
    }

    getUserInfo(id) {
        return this.http.get<UserVO>(this.getUserInfoUrl + id);
    }

    deleteUser(id) {
        return this.http.get<ResponseString>(this.deleteUserUrl + id);
    }

    getOrganizationTheme() {
        this.http.get<ResponseString>(this.getOrganizationThemeUrl).subscribe(data => {
            this.customerTheme = data.response;
        });
    }

    saveUserProfile(userVO) {
        return this.http.post<ResponseString>(this.saveUserProfileUrl, userVO.profilePicture);
    }

    createUser(userVO: UserVO) {
        if (userVO.userId == null) {
            return this.http.post<ResponseString>(this.saveUserUrl, userVO);
        } else {
            return this.http.post<ResponseString>(this.updateUserUrl, userVO);
        }
    }

    changePassword(passwordVO) {
        return this.http.post<any>(this.changePasswordUrl, passwordVO);
    }

    getUserProfilePicture() {
        return this.http.get<UserVO>(this.getLoggedUserProfilePictureUrl);
    }

    checkOtp(qrDetailsVo: QrDetailsVo): Observable<any> {
        return this.http.post<QrDetailsVo>(this.checkOtpUrl, qrDetailsVo);
    }

    getTeamsCount() {
        return this.http.get<ResponseString>(this.getTeamsCountUrl);
    }
}
