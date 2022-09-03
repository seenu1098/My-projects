// import { Page, Permission } from "yoroapps-creation/lib/shared/vo/page-vo";
import { Page, Permission } from "../../creation-module/shared/vo/page-vo";

export class MarketPlaceVO {
    id: string;
    uploadWorkflows: string;
    jsonData: any;
    noOfInstalledCounts: number;
    install = false;
    updatedDate: any;
    developerName: any;
    description: any;
    approve: any;
    startKey: any;
}

export class JsonData {
    workflowVO: any;
    page: Page[] = [];
    permission: Permission[] = [];
    tableObjectListVO: TableObjectsVO[] = [];
    subdomainName: string;
}

export class TableObjectsVO {
    tableObjectId: string;
    tableName: string;
    tableIdentifier: string;
    publicTable: boolean;
    tableObjectsColumns: TableObjectsColumns[];
    deletedColumnIDList: string[];
}
export class TableObjectsColumns {
    id: string;
    columnName: string;
    dataType: string;
    fieldSize: string;
    isUnique: string;
    isRequired: string;
}

export class ExportPages {
    pageId: string;
    version: number;
    taskId: string;
    taskName: string;
}

export class PageIdListVO {
    uuidList: string[] = [];
}

export class TableListVO {
    tableList: string[];
}

export class InstalledApps {
    id: string;
    processDefinitionName: string;
    install: string;
    installFrom: string;
    description: string;
    startKey: any;
}

export class EnableInstall {
    processDefinitionName: string;
    install: any;
}