export class PaginationVO {
    index: number;
    size: number;
    direction: string;
    columnName: string;
    id: number;
    filterValue: FilterValuesVO[] = [];
    filterIndex: number;
    filterColumnName: string;
}
export class FilterValuesVO {
    filterIdColumn: string;
    operators: string;
    filterDataType: string;
    filterIdColumnValue: string;
}
export class Paginator {
    totalRecords: any;
    pageSize: any;
    index: any;
}