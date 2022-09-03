export class PaginationVO {
    gridId: string;
    index: number;
    size: number;
    direction: string;
    columnName: string;
    // tslint:disable-next-line: no-use-before-declare
    filterValue: FilterValueVO[] = [];
    staticFilterVO: StaticFilterVO[] = [];
    isUnAssigned: boolean;
    isNoRoles: boolean;
    id: string;
    allWorkspace:boolean;
}
export class FilterValueVO {
    filterIdColumn: string;
    operators: string;
    filterIdColumnValue: string;
}

export class StaticFilterVO {
    filterName: string;
    operator: string;
    filterType: string;
    filterValue: string;
}
