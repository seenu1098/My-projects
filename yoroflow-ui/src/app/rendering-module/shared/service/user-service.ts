import { AuthToken, AuthTokenVo } from './../../../login-module/auth-token';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { ResponseString } from '../vo/response-vo';
import { UserVO } from '../vo/user-vo';
import { TokenHeaderService } from '../../../shared-module/services/token-header.service';
import { GroupVO } from '../vo/group-vo';
import { environment } from 'src/environments/environment';
import decode from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private http: HttpClient, private tokenService: TokenHeaderService) { }
    userAccess: boolean;
    url = environment.renderingBaseUrl;
    public redirectUrl: string;
    customerTheme: any;
    userVO = new UserVO();

    getLoggedUserDetailsUrl = this.url + '/user-service/v1/get/logged-in/user-details';
    loginUrl = this.url + '/user-service/v1/authenticate';
    updatePasswordUrl = this.url + '/user-service/v1/change/password/user-management';
    signupUserUrl = this.url + '/signup-service/v1/invite/user';
    inviteUserUrl = this.url + '/user-service/v1/invite/user';
    updateRolesUrl = this.url + '/user-service/v1/update/user-management';

    getRolesNamesUrl = this.url + '/user-service/v1/get-role-name-list';
    getUserInfoUrl = this.url + '/user-service/v1/get-user-form/';
    deleteUserUrl = this.url + '/user-service/v1/delete/';
    getOrganizationThemeUrl = environment.renderingBaseUrl + '/customer/v1/get/theme';

    getUserNameAutocompleteListUrl = environment.workflowBaseurl + '/user-service/v1/get/user-names/';
    getGroupNameAutocompleteListUrl = environment.workflowBaseurl + '/user-group/v1/get/group-name/';
    getLoggedUserProfilePictureUrl = this.url + '/user-service/v1/get/logged-in/user-profile-picture';

    getTeamsCountUrl = environment.renderingBaseUrl + '/group/v1/get/teams-count';
    saveThemeUrl = environment.renderingBaseUrl + '/user-service/v1/save/theme';
    removeTokenUrl = environment.authUrl + '/user-service/v1/remove-token';
    checkCustomAttributeurl = environment.workflowBaseurl + '/org-custom-attribute/v1/check';
    private getUsersListUrl = environment.baseurl + '/user-service/v1/get/users';
    private getWorkspaceUsersListUrl = environment.creationBaseUrl + '/workspace/v1/get/workspace-users/';
    private getSelectedTeamUsersListUrl = environment.creationBaseUrl + '/group/v1/get/groups';

    @Output() logoutEmitter: EventEmitter<any> = new EventEmitter<any>();

    getToken() {
        return localStorage.getItem('token');
    }

    checkCustomAttribute() {
        return this.http.get<any>(this.checkCustomAttributeurl);
    }

    getUsers(userName) {
        return this.http.get<UserVO[]>(this.getUserNameAutocompleteListUrl + userName);
    }

    getGroups(groupName) {
        return this.http.get<GroupVO[]>(this.getGroupNameAutocompleteListUrl + groupName);
    }

    getSubscriptionExpired() {
        const token = localStorage.getItem('token');
        const tokenPayload = decode(token);
        return tokenPayload.isSubscriptionExpired;
    }



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
        return this.http.get<UserVO>(this.getLoggedUserDetailsUrl, this.tokenService.getHeader());
    }

    removeToken() {
        let token = this.getToken();
        if (token && token.includes('Bearer')) {
            token = token.substring(7);
        }
        const authToken = new AuthTokenVo();
        authToken.token = token;
        return this.http.post<AuthToken>(this.removeTokenUrl, authToken);
    }

    logout(): void {
        this.logoutEmitter.emit('logout');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
    }

    updatePassword(userVO) {
        return this.http.post<ResponseString>(this.updatePasswordUrl, userVO);
    }

    updateRoles(userVO) {
        return this.http.post<ResponseString>(this.updateRolesUrl, userVO);
    }

    /* getRolesNames() {
         return this.http.get<RolesListVO[]>(this.getRolesNamesUrl);
     }
 
     getUserInfo(id) {
         return this.http.get<UserVO>(this.getUserInfoUrl + id);
     }*/

    deleteUser(id) {
        return this.http.get<ResponseString>(this.deleteUserUrl + id);
    }

    getOrganizationTheme() {
        this.http.get<ResponseString>(this.getOrganizationThemeUrl).subscribe(data => {
            this.customerTheme = data.response;
        });
    }

    getUserProfilePicture() {
        return this.http.get<UserVO>(this.getLoggedUserProfilePictureUrl);
    }

    getTeamsCount() {
        return this.http.get<ResponseString>(this.getTeamsCountUrl);
    }

    saveTheme(userVO: UserVO): Observable<any> {
        return this.http.post<any>(this.saveThemeUrl, userVO);
    }

    public getUsersList(): Observable<any> {
        return this.http.get<any>(this.getUsersListUrl);
    }

    public getWorkspaceUsersList(workspaceId: string): Observable<any> {
        return this.http.get<any>(this.getWorkspaceUsersListUrl + workspaceId);
    }

    public getSelectedTeamUsersList(response: ResponseString): Observable<any> {
        return this.http.post<any>(this.getSelectedTeamUsersListUrl, response);
    }
}
