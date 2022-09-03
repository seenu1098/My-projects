export class TaskBoardTaskSummaryVo {
    taskboardName: string;
    inProcessCount: number;
    completedCount: number;
}

export class WorkflowSummaryVO {
    processDefinitionName: string;
    inProcessCount: number;
    completedCount: number;
}

export class OrgSummaryReportVo {
    id: string;
    activeUsersCount: number;
    teamsCount: number;
    lastLoggedInUser: string;
    userColor: string;
    lastLoggedInUserDateAndTime: any;
}

export class HeaderVO {
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
    style: any;
}
