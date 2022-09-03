import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ResponseString } from '../shared/vo/response-vo';
import { MenuVO, MenuDetailsVO } from './menu-vo';
import { TokenHeaderService } from '../../shared-module/services/token-header.service';
import { Page } from '../shared/vo/page-vo';
import { Application } from '../shared/vo/appication-vo';
import { environment } from '../../../environments/environment';
import { CustomPage } from '../shared/vo/custom-page-vo';
import { ExistingCheckVO } from '../shared/vo/existing-check-vo';
import { WorkspaceService } from 'src/app/workspace-module/create-dialog/workspace.service';


@Injectable({
  providedIn: 'root'
})
export class MenuService {
  saveUrl = environment.creationBaseUrl + '/menu/v1/save';
  getMenuInfoUrl = environment.creationBaseUrl + '/menu/v1/get/';
  getMenuByAppIdUrl = environment.creationBaseUrl + '/menu/v1/get-menu/';
  getPageNamesUrl = environment.creationBaseUrl + '/menu/v1/get/page-name/';
  getParentMenuNamesUrl = environment.creationBaseUrl + '/menu/v1/get/parent-menu-names/';
  getApplicationistUrl = environment.creationBaseUrl + '/application/v1/get-app-list/';
  removeParentMenuUrl = environment.creationBaseUrl + '/menu/v1/remove/parent-menu/';
  getMenuListUrl = environment.renderingBaseUrl + '/menu/v1/get-menu-list';
  getCustomPageListUrl = environment.renderingBaseUrl + '/custom-page/v1/get-list';
  getMenuExistCheckListUrl = environment.creationBaseUrl + '/menu/v1/check-menu/';

  constructor(private http: HttpClient, private tokenHeaderService: TokenHeaderService, private workspaceService: WorkspaceService) { }

  checkMenuExistOrNot(appId, orientation) {
    if (appId != null && orientation !== undefined && orientation !== null) {
      return this.http.get<ExistingCheckVO>(this.getMenuExistCheckListUrl + appId + '/' + orientation);
    }
  }

  getCustomPageList() {
    return this.http.get<CustomPage[]>(this.getCustomPageListUrl);
  }
  save(vo: MenuVO) {
    return this.http.post<ResponseString>(this.saveUrl, vo, this.tokenHeaderService.getHeader());
  }

  getMenuList() {
    return this.http.get<MenuVO[]>(this.getMenuListUrl);
  }

  getMenuInfo(id: string) {
    return this.http.get<MenuVO>(this.getMenuInfoUrl + id, this.tokenHeaderService.getHeader());
  }

  getMenuByAppId(id) {
    return this.http.get<MenuVO>(this.getMenuByAppIdUrl + id);
  }

  getPageNames(pageName: string) {
    return this.http.get<Page[]>(this.getPageNamesUrl + pageName, this.tokenHeaderService.getHeader());
  }

  getParentMenuNames(menuName: string) {
    return this.http.get<MenuDetailsVO[]>(this.getParentMenuNamesUrl + menuName, this.tokenHeaderService.getHeader());
  }

  getApplicationList() {
    return this.http.get<Application[]>(this.getApplicationistUrl + this.workspaceService.workspaceID);
  }

  removeParentMenu(id: string) {
    return this.http.get<ExistingCheckVO>(this.removeParentMenuUrl + id, this.tokenHeaderService.getHeader());
  }

  checkMenuName(menuName) {
    return this.http.get<any>(this.getMenuExistCheckListUrl + menuName);
  }

}
