export class DataTableVO {
    tableObjectId: string;
    tableName: string;
    tableIdentifier: string;
    publicTable: boolean;
    tableDescription: string;
    tableObjectsColumns: DataTableColumnsVO[];
    deletedColumnIDList: string[] = [];
}

export class DataTableColumnsVO {
    columnIdentifier: string;
    id: string;
    columnName: string;
    dataType: string;
    fieldSize: string;
    isUnique: boolean;
    isRequired: string;
    color: string;
}