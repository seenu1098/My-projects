export class PaginationVO {
    index: number;
    size: number;
    direction: string;
    columnName: string;
    processInstanceId: string;
    taskStatus: string;
    filterValue: FilterValueVO[] = [];
}
export class FilterValueVO {
    filterIdColumn: string;
    operators: string;
    filterIdColumnValue: string;
}

