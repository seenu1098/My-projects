import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { AuthToken } from './vo/auth-token-vo';
import { RolesListVO, UserVO } from './vo/user-vo';
import { ResponseString } from './vo/reponse-vo';
import { environment } from '../../../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private http: HttpClient) { }
    userAccess: boolean;
    public redirectUrl: string;
    customerTheme: any;

    getLoggedUserDetailsUrl = environment.creationBaseUrl + '/user-service/v1/get/logged-in/user-details';
    loginUrl = environment.workflowBaseurl + '/user-service/v1/authenticate';
    updatePasswordUrl = environment.creationBaseUrl + '/user-service/v1/change/password/user-management';
    signupUserUrl = environment.workflowBaseurl + '/signup-service/v1/invite/user';
    inviteUserUrl = environment.workflowBaseurl + '/user-service/v1/invite/user';
    updateRolesUrl = environment.workflowBaseurl + '/user-service/v1/update/user-management';
    saveUserUrl = environment.creationBaseUrl + '/user-service/v1/save/user-management';
    getRolesNamesUrl = environment.workflowBaseurl + '/user-service/v1/get-role-name-list';
    getUserInfoUrl = environment.creationBaseUrl + '/user-service/v1/get-user-form/';
    deleteUserUrl = environment.workflowBaseurl + '/user-service/v1/delete/';
    getOrganizationThemeUrl = environment.workflowBaseurl + '/customer/v1/get/theme';
    therapyUrl = environment.creationBaseUrl + '/therapy-service/v1';
    sendMessage = environment.creationBaseUrl + '/user-service/v1/send/message';
    associateGroupUrl = environment.creationBaseUrl + '/user-service/v1/associate/group';
    groupURl = environment.renderingBaseUrl + '/group/v1';
    getUsersListWithPaginationUrl = environment.creationBaseUrl + '/user-service/v1/get-all-users';
    enableTwoFactorAuthUrl = environment.creationBaseUrl + '/user-service/v1/save/enable-two-factor';
    resetTwoFactorAuthUrl = environment.creationBaseUrl + '/user-service/v1/reset/two-factor/';
    saveUserChangesUrl = environment.creationBaseUrl + '/user-service/v1/save-user-changes';
    inActivateAllUsersUrl = environment.creationBaseUrl + '/user-service/v1/inactivate-all-users';
    private isAllowedUrl = environment.creationBaseUrl + '/user-service/v1/license/is-allowed';
    private getAllUsersWithoutWorkspaceUrl = environment.creationBaseUrl + '/user-service/v1/get-all-total-users';

    associateGroup(uservo) {
        return this.http.post<any>(this.associateGroupUrl, uservo);
    }

    getLoggedInUserDetails() {
        return this.http.get<UserVO>(this.getLoggedUserDetailsUrl);
    }

    getToken() {
        return localStorage.getItem('token');
    }

    userLogin(login: any) {
        return this.http.post<AuthToken>(this.loginUrl, login);
    }

    loggedIn() {
        return !!this.getToken();
    }

    getRolesNames() {
        return this.http.get<RolesListVO[]>(this.getRolesNamesUrl);
    }
    createUser(userVO) {
        return this.http.post<ResponseString>(this.saveUserUrl, userVO);
    }
    getRedirectUrl(): any {
        return this.redirectUrl;
    }
    updateRoles(userVO) {
        return this.http.post<ResponseString>(this.updateRolesUrl, userVO);
    }
    getUserInfo(id) {
        return this.http.get<UserVO>(this.getUserInfoUrl + id);
    }

    deleteUser(id) {
        return this.http.get<ResponseString>(this.deleteUserUrl + id);
    }
    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
    }

    updatePassword(userVO) {
        return this.http.post<ResponseString>(this.updatePasswordUrl, userVO);
    }

    sendMail(userVO) {
        return this.http.post<ResponseString>(this.sendMessage, userVO);
    }

    getGroupList() {
        return this.http.get<any[]>(this.groupURl + '/get/groups');
    }

    getAllUsersListWithPagination(paginationVO) {
        return this.http.post<any>(this.getUsersListWithPaginationUrl, paginationVO);
    }

    enableTwoFactorAuth(enableTwoFactorVO) {
        return this.http.post<ResponseString>(this.enableTwoFactorAuthUrl, enableTwoFactorVO);
    }

    resetTwoFactorAuth(userId) {
        return this.http.get<ResponseString>(this.resetTwoFactorAuthUrl + userId);
    }

    saveUserChanges(userVO) {
        return this.http.post<ResponseString>(this.saveUserChangesUrl, userVO);
    }

    inActivateAllUsers(enableTwoFactorVO) {
        return this.http.post<ResponseString>(this.inActivateAllUsersUrl, enableTwoFactorVO);
    }

    public isAllowed(): Observable<any> {
        return this.http.get<ResponseString>(this.isAllowedUrl);
    }

    getAllUsersWithoutWorkspace() {
        return this.http.get<any>(this.getAllUsersWithoutWorkspaceUrl);
    }
}

