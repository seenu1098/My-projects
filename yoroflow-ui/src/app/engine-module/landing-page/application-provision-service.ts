import { HttpClient } from '@angular/common/http';

import { TokenHeaderService } from '../../shared-module/services/token-header.service';
import { Injectable } from '@angular/core';
import { Application } from './appication-vo';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class ApplicationProvisionService {

    applicationProvisionUrl = environment.renderingBaseUrl + '/application/v1';
    getApplicationUrl = this.applicationProvisionUrl + '/get/';
    getApplicationCountUrl = this.applicationProvisionUrl + '/get/application-count/';
    // getApplicationLogoUrl = this.applicationProvisionUrl + '/get/logo/';

    constructor(private http: HttpClient, private tokenHeaderService: TokenHeaderService) { }

    getApplication(id: string) {
        return this.http.get<Application>(this.getApplicationUrl + id);
    }

    // getApplicationLogo(id) {
    //     return this.http.get<any>(this.getApplicationLogoUrl + id);
    // }

}
