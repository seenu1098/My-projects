export class TableObjectsVO {
    tableObjectId: string;
    tableName: string;
    tableIdentifier: string;
    publicTable: boolean;
    tableDescription: string;
    tableObjectsColumns: TableObjectsColumns[];
    deletedColumnIDList: string[] = [];
    color: string;
}

export class TableObjectsColumns {
    columnIdentifier: string;
    id: string;
    columnName: string;
    dataType: string;
    fieldSize: string;
    isUnique: boolean;
    isRequired: boolean;
    style: string;
    isSort: boolean;
}

export class TableListVO {
    tableList: string[];
}
