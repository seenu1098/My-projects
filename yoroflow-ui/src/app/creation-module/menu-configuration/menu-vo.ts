export class MenuDetailsVO {
    id: string;
    menuName: string;
    pageType: string;
    pageName: string;
    menuPath: string;
    pageId: string;
    parentMenu: string;
    parentMenuId: string;
    customPageId: any;
    displayOrder: number;
    dynamicMenus: MenuDetailsVO[];
    icon: string;
}
export class MenuVO {
    menuId: string;
    menuName: string;
    menuOrientation: string;
    collapsible: string;
    applicationId: string;
    applicationName: string;
    menuDetails: MenuDetailsVO[] = [new MenuDetailsVO()];
    deleteMenuDetailsIdList: string[] = [];
    parentMenuList: MenuDetailsVO[];
    isManaged: boolean;
}


