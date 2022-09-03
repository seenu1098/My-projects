export class PaginationVO {
    gridId: string;
    index: number;
    size: number;
    direction: string;
    columnName: string;
    id: string;
    filterValue: FilterValueVO[] = [];

}

export class FilterValueVO {
    filterIdColumn: string;
    operators: string;
    filterIdColumnValue: string;
}

