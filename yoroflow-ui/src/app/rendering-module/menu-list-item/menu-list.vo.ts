export class Menu {
    id: string;
    menuName: string;
    pageName: string;
    pageId: string;
    parentMenu: string;
    parentMenuId: string;
    customPageId: string;
    displayOrder: number;
    dynamicMenus: Menu[];
    menuPath: string;
    version: any;
    pageType: any;
    style: any;
    icon: any;
    reportId: any;
    openPanel=false;
}