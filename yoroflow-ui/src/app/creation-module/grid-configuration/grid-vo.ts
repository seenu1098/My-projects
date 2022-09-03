// import { FieldConfig } from '../shared/vo/page-vo';

export class GridColumns {
    id: string;
    columnName: string;
    objectFieldName: string;
    displayName: string;
    sortable: boolean;
    widthPercentage: string;
    filterable: string;
    fieldType: string;
    columnSequenceNo: number;
    hiddenValue: string;
    defaultSortableColumn: boolean;
    passParams: boolean;
    asc: boolean;
    desc: boolean;
    dateTimeFormat: string;
}

export class GridFilterVO {
    filterId: string;
    filterName: string;
    operator: string;
    filterType: string;
    filterValue: string;
}


export class Grid {
    gridId: string;
    gridName: string;
    moduleName: string;
    widthPercentage: number;
    filterable: string;
    gridUrl: string;
    defaultSortableColumn: string;
    showCheckBox: string;
    passParams: string;
    sortDirection: string;
    gridColumns: GridColumns[] = [new GridColumns()];
    permanentFilterColumns: GridFilterVO[];
    globalFilterColumns: GridFilterVO[];
    deletedColumnIDList: string[] = [];
    deletedPermanentFilterIdList: string[] = [];
    deletedGlobalFilterIdList: string[] = [];
    defaultNoOfRows: number;
    exportable: string;
    userSpecificGridData: boolean;
    fieldValues: string;
    gridColumnNames: any[];
    // fieldConfig: FieldConfig;
}

export class GridColumnNames {
    label: string;
    name: string;
    dataType: string;
}
