export class PaginationVO {
    index: number;
    size: number;
    direction: string;
    columnName: string;
    id: number;
    taskStatus: string;
    dueDateBoolean: boolean;
    filterValue: FilterValuesVO[] = [];
    forFilterList: boolean;
    wildSearch: string;
    taskType: string;
    taskName: string;
    filterIndex: number;
    taskNameList: any;
    filterIndexList: number[];
    taskboardId: string;
    filterColumnName: string;
    workspaceId: string;
    workspaceIdList: string[] = [];
    taskboardIdList: string[] = [];
    widgetName: string;
    startDate: any;
    endDate: any;
    filterType: string;
    allWorkspace:boolean;
}

export class FilterValuesVO {
    filterIdColumn: string;
    operators: string;
    filterDataType: string;
    filterIdColumnValue: string;
}
export class FieldValueVO {
    fieldId: string;
    fieldName: string;
    datatype: string;
    taskType: string;
}
export class ReassignTaskVO {
    instanceId: any;
    instanceTaskId: any;
    assignedToUser: any;
    assignedToGroup: any;
    status: any;
}


