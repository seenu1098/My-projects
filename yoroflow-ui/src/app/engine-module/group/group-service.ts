import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenHeaderService } from '../../shared-module/services/token-header.service';
import { Group } from './group-vo';
import { ResponseString } from '../shared/vo/reponse-vo';
import { YoroGroups } from '../yoro-security/security-vo';
import { UserVO } from '../shared/vo/user-vo';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class GroupService {
    groupURl = environment.renderingBaseUrl + '/group/v1';


    private isAllowedUrl = environment.renderingBaseUrl + '/group/v1/license/is-allowed';

    constructor(private http: HttpClient, private tokenHeaderService: TokenHeaderService) { }

    saveGroup(groupVO: Group) {
        return this.http.post<ResponseString>(this.groupURl + '/save', groupVO, this.tokenHeaderService.getHeader());
    }

    getGroupInfo(id) {
        return this.http.get<Group>(this.groupURl + '/get/' + id, this.tokenHeaderService.getHeader());
    }

    getGroupList() {
        return this.http.get<any[]>(this.groupURl + '/get/groups', this.tokenHeaderService.getHeader());
    }

    getTeamList() {
        return this.http.get<any[]>(this.groupURl + '/get/all-groups', this.tokenHeaderService.getHeader());
    }

    saveOwnersForTeam(yoroGroupsUserVO) {
        return this.http.post<any>(this.groupURl + '/save/yoro-groups-owners', yoroGroupsUserVO, this.tokenHeaderService.getHeader());
    }

    getUserIdList(id) {
        return this.http.get<any[]>(this.groupURl + '/get/user-id/' + id, this.tokenHeaderService.getHeader());
    }

    getAllUserIdList() {
        return this.http.get<any[]>(this.groupURl + '/get/user-id', this.tokenHeaderService.getHeader());
    }

    saveYoroGroupsUsers(yoroGroupsUserVO) {
        return this.http.post<ResponseString>(this.groupURl + '/save/yoro-groups-users',
            yoroGroupsUserVO, this.tokenHeaderService.getHeader());
    }

    public isAllowed(): Observable<any> {
        return this.http.get<ResponseString>(this.isAllowedUrl);
    }
}
