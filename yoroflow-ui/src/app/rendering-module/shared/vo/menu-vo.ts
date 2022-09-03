export class MenuDetailsVO {
    id: string;
    menuName: string;
    pageName: string;
    pageId: string;
    parentMenu: string;
    parentMenuId: string;
    customPageId: string;
    displayOrder: number;
    dynamicMenus: MenuDetailsVO[];
    menuPath: string;
    version: any;
    pageType: any;
    style: any;
    icon: any;
    openPanel: boolean;
}
export class MenuVO {
    menuId: string;
    menuName: string;
    menuOrientation: string;
    collapsible: string;
    applicationId: string;
    applicationName: string;
    menuDetails: MenuDetailsVO[] = [new MenuDetailsVO()];
}