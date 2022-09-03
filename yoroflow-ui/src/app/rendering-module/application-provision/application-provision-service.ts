import { HttpClient } from '@angular/common/http';

import { TokenHeaderService } from '../../shared-module/services/token-header.service';
import { ResponseString } from '../shared/vo/response-vo';
import { Injectable } from '@angular/core';
import { Application } from './appication-vo';
import { environment } from '../../../environments/environment';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';

@Injectable({
    providedIn: 'root'
})

export class ApplicationProvisionService {

    applicationProvisionUrl = environment.renderingBaseUrl + '/application/v1';
    getApplicationUrl = this.applicationProvisionUrl + '/get/';
    getApplicationCountUrl = this.applicationProvisionUrl + '/get/application-count/';
    // getApplicationLogoUrl = this.applicationProvisionUrl + '/get/logo/';

    constructor(private http: HttpClient, private tokenHeaderService: TokenHeaderService, private workspaceService: WorkspaceService) { }

    checkWithSubdomainName(applicationVO: Application) {
        return this.http.get<ResponseString>(this.applicationProvisionUrl + '/check-subdomain-name/' +
            applicationVO.applicationId);
    }
    saveApplication(applicationVO: Application) {
        return this.http.post<any>(this.applicationProvisionUrl +
            '/save/' + this.workspaceService.workspaceID, applicationVO.logo);
    }

    checkWithApplicationName(applicationName) {
        return this.http.get<ResponseString>(this.applicationProvisionUrl +
            '/check-application-name/' + applicationName);
    }

    getApplication(id: string) {
        return this.http.get<Application>(this.getApplicationUrl + id);
    }

    getApplicationCount() {
        return this.http.get<ResponseString>(this.getApplicationCountUrl+this.workspaceService.workspaceID);
    }

    // getApplicationLogo(id) {
    //     return this.http.get<any>(this.getApplicationLogoUrl + id);
    // }

}
