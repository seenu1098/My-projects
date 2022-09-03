export class HeadersVO {
    checkboxEnabled: boolean;
    filterEnabled: boolean;
    exportEnabled: boolean;

    tableWidth: number;
    defaultPageSize: number;
    defaultSortColumn: string;

    headers: HeaderVO[];
}

export interface HeaderVO {
    headerId: string;
    headerName: string;

    sortable: boolean;
    filterable: boolean;
    hidden: boolean;
    enabled: boolean;
    parameterOnClick: boolean;

    widthPercentage: number;

    fieldDataType: string;
    columnSeqNo: number;
    style:any;
}
