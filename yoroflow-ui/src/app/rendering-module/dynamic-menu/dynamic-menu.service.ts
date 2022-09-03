import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


import { environment } from '../../../environments/environment';
import { MenuDetailsVO, MenuVO } from '../shared/vo/menu-vo';

@Injectable({
  providedIn: 'root'
})
export class DynamicMenuService {
  getAllMenusDetailsUrl = environment.renderingBaseUrl + '/menu/v1/get/list/';
  getMenuListUrl = environment.renderingBaseUrl + '/menu/v1/get';

  constructor(private http: HttpClient) { }

  getToken() {
    return localStorage.getItem('token');
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


   getAllMenusDetails(id) {
    // if (id === 'yoroapps-system-menu') {
    //   return this.getSystemMenuDetails();
    // }
    return this.http.get<MenuDetailsVO[]>(this.getAllMenusDetailsUrl + id);

  }

  getMenuList() {
    return this.http.get<MenuVO[]>(this.getMenuListUrl);
  }

  getSystemMenuDetails() {
    return [
      {
        'menuId': null,
        'id': 38,
        'menuName': 'Auto Complete',
        'pageName': 'test-  AutoComplete',
        'pageIdentifier': null,
        'pageId': 'test-autocomplete',
        'parentMenuId': null,
        'menuPath': 'page',
        'parentMenu': null,
        'dynamicMenus': null
      },
      {
        'menuId': null,
        'id': 40,
        'menuName': 'Menu Child',
        'pageName': null,
        'pageIdentifier': null,
        'pageId': null,
        'parentMenuId': null,
        'menuPath': 'page',
        'parentMenu': null,
        'dynamicMenus': [
          {
            'menuId': null,
            'id': 41,
            'menuName': 'Child',
            'pageName': null,
            'pageIdentifier': null,
            'pageId': 'newtestpage',
            'parentMenuId': 40,
            'menuPath': 'page',
            'parentMenu': 'Menu Child',
            'dynamicMenus': null
          }
        ]
      }
    ];
  }
}
