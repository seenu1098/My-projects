import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ResponseString } from '../shared/vo/response-vo';
import { MenuVO, MenuDetailsVO } from './menu-vo';
import { TokenHeaderService } from '../../shared-module/services/token-header.service';
import { Page } from '../shared/vo/page-vo';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  saveUrl = environment.renderingBaseUrl + '/menu/v1/save';
  getMenuInfoUrl = environment.renderingBaseUrl + '/menu/v1/get/';
  getMenuByAppIdUrl = environment.renderingBaseUrl + '/menu/v1/get-menu/';
  getPageNamesUrl = environment.renderingBaseUrl + '/menu/v1/get/page-name/';
  getParentMenuNamesUrl = environment.renderingBaseUrl + '/menu/v1/get/parent-menu-names/';

  constructor(private http: HttpClient, private tokenHeaderService: TokenHeaderService) { }

  save(vo: MenuVO) {
    return this.http.post<ResponseString>(this.saveUrl, vo, this.tokenHeaderService.getHeader());
  }

  getMenuInfo(id: number) {
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
}
