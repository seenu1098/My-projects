import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


import { Observable } from 'rxjs';

import { ResponseString } from '../vo/reponse-vo';
import { environment } from '../../../../environments/environment';
import { AuthToken } from '../vo/auth-token';
import { UserVO } from '../vo/user-vo';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private http: HttpClient) { }
    userAccess: boolean;
    url = environment.baseurl;
    public redirectUrl: string;
    customerTheme: any;

    getLoggedUserDetailsUrl = this.url + '/user-service/v1/get/logged-in/user-details';
    loginUrl = this.url + '/user-service/v1/authenticate';
    updatePasswordUrl = this.url + '/user-service/v1/change/password';

    getToken() {
        return localStorage.getItem('token');
    }

    userLogin(login: any) {
        return this.http.post<AuthToken>(this.loginUrl, login);
    }

    loggedIn() {
        return !!this.getToken();
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

    changePassword(passwordVO) {
        return this.http.post<any>(this.updatePasswordUrl, passwordVO);
    }
}
