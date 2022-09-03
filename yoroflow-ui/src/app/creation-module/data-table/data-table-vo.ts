export class DataTableVO {
    id: any;
    values: ColumnDataVO[] = [];
    duplicateColumns: string[] = [];
}

export class ColumnDataVO {
    columnIdentifier: string;
    columnValue: string;
    dataType: string;
}

export class DeleteDataTableValuesVO {
    tableId: string;
    idList: string[] = [];
}
export class paginatorForData {
    totalRecords: any;
    pageSize: any;
    index: any;
    previousPageIndex: any;
}

export class ListOfMapVO {
    fieldName: string;
    value: string;
    variableType: string;
    dataType: string;
}

export class TableSecurityVOList {
    tableId: string;
    securityTeamVOList: TableSecurityVO[];
    type: any;
    deletedTeamsIdList: any[];
    tableOwnersId: any[];
    deletedOwnerIdList: any[];
}

export class TableSecurityVO {
    groupId: any;
    readAllowed: boolean;
    updateAllowed: boolean;

}

export class MapVO {
    tableObjectsId: string;
    listOfMapVO: ListOfMapVO[] = [];
    duplicateColumns: string[] = [];
}

