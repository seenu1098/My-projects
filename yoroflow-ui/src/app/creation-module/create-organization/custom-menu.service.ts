import { Injectable } from '@angular/core';
import { CustomMenuList } from './customer-vo';

@Injectable({
  providedIn: 'root'
})
export class CustomMenuService {

  customMenuVo = new CustomMenuList();

  constructor() { }

  getMenuList(menuList) {
    const customMenuList: any[] = [];
    if (menuList.some(menu => menu.defaultMenu === 'My Tasks')) {
      const menu = menuList.find(menu => menu.defaultMenu === 'My Tasks');
      customMenuList.push(menu);
    }
    if (menuList.some(menu => menu.defaultMenu === 'Running Process')) {
      const menu = menuList.find(menu => menu.defaultMenu === 'Running Process');
      customMenuList.push(menu);
    }
    if (menuList.some(menu => menu.defaultMenu === 'Completed Process')) {
      const menu = menuList.find(menu => menu.defaultMenu === 'Completed Process');
      customMenuList.push(menu);
    }
    return customMenuList;
  }

  getDisplayPageName(menuName) {
    if (menuName === 'My Tasks') {
      return 'My Tasks';
    } else if (menuName === 'Running Process') {
      return 'Running Process'
    } else if (menuName === 'Completed Process') {
      return 'Completed Process'
    }
  }

}
