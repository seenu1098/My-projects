import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ResponseString } from '../vo/response-vo';
import { MenuVO, MenuDetailsVO } from '../vo/menu-vo';
import { TokenHeaderService } from '../../../shared-module/services/token-header.service';
import { Page } from '../vo/page-vo';
import { environment } from '../../../../environments/environment';

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

  getMobileMenus() {
    let menu: MenuDetailsVO[] = [];
    return menu = [
      {
        id: 'f99f201b-350b-4eff-9898-1b2b4b896360',
        menuName: 'Workflow',
        pageName: null,
        pageId: null,
        parentMenuId: null,
        displayOrder: 2,
        parentMenu: null,
        pageType: null,
        menuPath: '',
        customPageId: null,
        version: null,
        dynamicMenus: [
          {
            id: '8863d442-22db-4d18-97b8-903492c078ff',
            menuName: 'Dashboard',
            pageName: null,
            pageId: null,
            parentMenuId: 'f99f201b-350b-4eff-9898-1b2b4b896360',
            displayOrder: 1,
            parentMenu: 'Workflow',
            pageType: null,
            menuPath: 'dashboard',
            customPageId: '7644318d-afff-4a4f-8cd8-db88a7872b51',
            version: 1,
            dynamicMenus: null,
            style: null,
            icon: null,
            openPanel: false
          },
          {
            id: '8b87672a-3726-4a72-be97-b06091091aef',
            menuName: 'Workflow Applications',
            pageName: null,
            pageId: null,
            parentMenuId: 'f99f201b-350b-4eff-9898-1b2b4b896360',
            displayOrder: 3,
            parentMenu: 'Workflow',
            pageType: null,
            menuPath: 'workflow-application',
            customPageId: '6d94cc3d-9f2e-4784-9512-12cf30c808e0',
            version: 1,
            dynamicMenus: null,
            style: null,
            icon: null,
            openPanel: false
          }
        ],
        style: null,
        icon: null,
        openPanel: false
      },
      {
        id: '0085bcba-5e36-4e5b-b680-f23a5c6f2ba1',
        menuName: 'My Tasks',
        pageName: null,
        pageId: null,
        parentMenuId: null,
        displayOrder: 3,
        parentMenu: null,
        pageType: null,
        menuPath: 'my-pending-task',
        customPageId: '21b8264a-a55b-4672-b8c1-68b03bbbfb75',
        version: 1,
        dynamicMenus: null,
        style: null,
        icon: null,
        openPanel: false
      },
      {
        id: '6936fb8d-0291-4068-9f2f-1de17425757a',
        menuName: 'Tasks',
        pageName: null,
        pageId: null,
        parentMenuId: null,
        displayOrder: 4,
        parentMenu: null,
        pageType: null,
        menuPath: '',
        customPageId: null,
        version: null,
        dynamicMenus: [
          {
            id: '50c2ceab-d797-46bf-b12f-d10a24399771',
            menuName: 'My Launches',
            pageName: null,
            pageId: null,
            parentMenuId: '6936fb8d-0291-4068-9f2f-1de17425757a',
            displayOrder: 2,
            parentMenu: 'Tasks',
            pageType: null,
            menuPath: 'my-launched-task',
            customPageId: 'b9de72ee-c965-4455-9311-ab8900e1ad7e',
            version: 1,
            dynamicMenus: null,
            style: null,
            icon: null,
            openPanel: false
          },
          {
            id: 'ddcaad42-374a-474d-8323-4b8f3d68a317',
            menuName: 'Completed Tasks',
            pageName: null,
            pageId: null,
            parentMenuId: '6936fb8d-0291-4068-9f2f-1de17425757a',
            displayOrder: 3,
            parentMenu: 'Tasks',
            pageType: null,
            menuPath: 'my-done-task',
            customPageId: '1757435a-426a-4034-8252-ea91d5a7c6f1',
            version: 1,
            dynamicMenus: null,
            style: null,
            icon: null,
            openPanel: false
          }
        ],
        style: null,
        icon: null,
        openPanel: false
      },
      {
        id: 'dc829215-2276-488c-a9a2-4d1b67436ad3',
        menuName: 'Application',
        pageName: null,
        pageId: null,
        parentMenuId: null,
        displayOrder: 5,
        parentMenu: null,
        pageType: null,
        menuPath: '',
        customPageId: null,
        version: null,
        dynamicMenus: [
          {
            id: '36fc6b9f-1f89-46ae-8c17-6761072a01d0',
            menuName: 'Dashboard',
            pageName: null,
            pageId: null,
            parentMenuId: 'dc829215-2276-488c-a9a2-4d1b67436ad3',
            displayOrder: 1,
            parentMenu: 'Application',
            pageType: null,
            menuPath: 'application-dashboard',
            customPageId: 'be25720b-6dbf-4016-9635-b7a947866601',
            version: 1,
            dynamicMenus: null,
            style: null,
            icon: null,
            openPanel: false
          }
        ],
        style: null,
        icon: null,
        openPanel: false
      },
      {
        id: '2e463d60-466a-4574-a005-996c048eb6ea',
        menuName: 'Processes',
        pageName: null,
        pageId: null,
        parentMenuId: null,
        displayOrder: 6,
        parentMenu: null,
        pageType: null,
        menuPath: '',
        customPageId: null,
        version: null,
        dynamicMenus: [
          {
            id: 'a620c1a4-4ccc-4156-9e40-7f86c1303300',
            menuName: 'Running Process',
            pageName: null,
            pageId: null,
            parentMenuId: '2e463d60-466a-4574-a005-996c048eb6ea',
            displayOrder: 1,
            parentMenu: 'Processes',
            pageType: null,
            menuPath: 'process-instance-running-list',
            customPageId: 'f38e5da3-d869-49a8-921b-532b15428c97',
            version: 1,
            dynamicMenus: null,
            style: null,
            icon: null,
            openPanel: false
          },
          {
            id: '325dfb21-4118-4296-bb65-94b74e14d6f2',
            menuName: 'Completed Process',
            pageName: null,
            pageId: null,
            parentMenuId: '2e463d60-466a-4574-a005-996c048eb6ea',
            displayOrder: 2,
            parentMenu: 'Processes',
            pageType: null,
            menuPath: 'process-instance-completed-list',
            customPageId: '6d6b8e46-ddd1-431d-bc55-f7821292df0e',
            version: 1,
            dynamicMenus: null,
            style: null,
            icon: null,
            openPanel: false
          },
          {
            id: '4ec68a6b-f006-4ade-93ed-31d69184648e',
            menuName: 'Failed Process',
            pageName: null,
            pageId: null,
            parentMenuId: '2e463d60-466a-4574-a005-996c048eb6ea',
            displayOrder: 3,
            parentMenu: 'Processes',
            pageType: null,
            menuPath: 'process-instance-failed-list',
            customPageId: '746f37ec-bd35-49d0-8a17-3f24346d7ecc',
            version: 1,
            dynamicMenus: null,
            style: null,
            icon: null,
            openPanel: false
          }
        ],
        style: null,
        icon: null,
        openPanel: false
      },
      {
        id: '80c04e8a-9aa2-4220-a3e3-56683563ffad',
        menuName: 'Administration',
        pageName: null,
        pageId: null,
        parentMenuId: null,
        displayOrder: 7,
        parentMenu: null,
        pageType: null,
        menuPath: '',
        customPageId: null,
        version: null,
        dynamicMenus: [
          {
            id: '4d6485f9-6b2e-4fde-97b6-55bc68935bfe',
            menuName: 'User Management',
            pageName: null,
            pageId: null,
            parentMenuId: '80c04e8a-9aa2-4220-a3e3-56683563ffad',
            displayOrder: 1,
            parentMenu: 'Administration',
            pageType: null,
            menuPath: 'user-management',
            customPageId: 'c1495a3c-1db7-4a62-9bf9-52fe7dc24183',
            version: 1,
            dynamicMenus: null,
            style: null,
            icon: null,
            openPanel: false
          }
        ],
        style: null,
        icon: null,
        openPanel: false
      }
    ];
  }





}
