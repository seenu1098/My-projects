export class MenuDetailsVO {
    id: number;
    menuName: string;
    pageName: string;
    pageId: string;
    parentMenu: string;
    parentMenuId: number;
    displayOrder: number;
    dynamicMenus: MenuDetailsVO[];
}
export class MenuVO {
    menuId: number;
    menuName: string;
    menuOrientation: string;
    collapsible: string;
    applicationId: number;
    applicationName: string;
    menuDetails: MenuDetailsVO[] = [new MenuDetailsVO()];
}


