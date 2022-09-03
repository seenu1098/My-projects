import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ResponseStringVO } from '../vo/response-vo';
import { Observable } from 'rxjs';
import { UserVO } from '../../app/login/user-vo';
import { AuthToken } from '../../app/login/auth-token';
import { User } from 'src/app/signup/signup-vo';
import { RolesNamesListVO } from '../vo/roles-vo';



@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private http: HttpClient) { }
    userAccess: boolean;
    url = environment.baseURL;

    createUserurl = this.url + '/user-service/v1/create/user';

    changePasswordUrl = this.url + '/user-service/v1/change/password';

    getLoggedUserDetailsUrl = this.url + '/user-service/v1/get/logged-in/user-details';

    loginUrl = this.url + '/user-service/v1/authenticate';

    getUserFormUrl = this.url + '/user-service/v1/get-user-form';

    updatePasswordUrl = this.url + '/user-service/v1/change/password/user-management';

    updateRolesAndGlobalSpecificationUrl = this.url + '/user-service/v1/update/user-management';

    getRolesNamesUrl = this.url + '/user-service/v1/get-role-name-list';

    loginExternalTokenUrl = this.url + '/api/v1/user/externalToken/verify';

    getToken() {
        return localStorage.getItem('token');
    }

    getRoles(): string[] {
        return localStorage.getItem('role').split(',');
    }

    userLogin(login) {
        return this.http.post<AuthToken>(this.loginUrl, login);
    }

    loggedIn() {
        return !!this.getToken();
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

    changePassword(passwordVO) {
        return this.http.post<ResponseStringVO>(this.changePasswordUrl, passwordVO, this.getHeader());
    }

    signup(signupVO) {
        return this.http.post<ResponseStringVO>(this.createUserurl, signupVO);
    }

    getUserForm(id) {
        return this.http.get<User>(this.getUserFormUrl + '/' + id);
    }

    updatePassword(userVO) {
        return this.http.post<ResponseStringVO>(this.updatePasswordUrl, userVO);
    }

    updateRolesAndGlobalSpecification(userVO) {
        return this.http.post<ResponseStringVO>(this.updateRolesAndGlobalSpecificationUrl, userVO);
    }

    getRolesNames() {
        return this.http.get<RolesNamesListVO[]>(this.getRolesNamesUrl);
    }

    loginWithExternalToken(token) {
        const httpOptions = {
            headers: new HttpHeaders({ 'Authorization': 'Bearer ' + token })
        };
        return this.http.get<any>(this.loginExternalTokenUrl, httpOptions);
    }
}
