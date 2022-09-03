export class PaginationVo {
    index: number;
    size: number;
    direction: string;
    columnName: string;
    taskStatus: string;
    processInstanceId: string;
    filterValue: FilterValueVO[] = [];
}
export class FilterValueVO {
    filterIdColumn: string;
    operators: string;
    filterIdColumnValue: string;
    totalTimeFilterValue: string;
}
export class FieldValueVO {
    fieldId: string;
    fieldName: string;
    datatype: string;
    taskType: string;
}
