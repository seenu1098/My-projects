export class WorkFlowList {
    processDefinitionId: any;
    key: string;
    processDefinitionName: string;
    workflowVersion: any;
    canEdit = false;
    canLaunch = false;
    canPublish = false;
}

export class WorkflowReportVo {
    id: any;
    reportType: string;
    reportName: string;
    workflowName: string;
    workflowKey: string;
    workflowVersion: string;
    taskName: string;
    reportJson: any;
    taskId: any;
    enableReport: boolean;
    latestVersion: boolean;
    workspaceId: any;
    groupId: any[];
}

export class WorkflowReportSecurityVo {
    id: any;
    reportId: any;
	groupId: any;
}

export class ReportGenerationVo {
    data: any[];
    reportHeaders: ReportHeadersVo[];
    totalRecords: string;
    reportName: string;
}

export class ReportHeadersVo {
    headerName: string;
    headerId: string;
    headerDetails: any;
    style: any;
}

export class FilterValueVoList {
    columnId: any;
    repeatablefieldId: any;
    filterDatatype: any;
}

export class PaginationVO {
    index: number;
    size: number;
    direction: string;
    columnName: string;
    id: number;
    taskStatus: string;
    dueDateBoolean: boolean;
    filterValue: FilterValueVO[] = [];
    // forFilterList: boolean;
    // wildSearch: string;
    dateSearch: string;
    taskName: string;
    processInstanceId: any;
    startDate: any;
    endDate: any;
}
export class FilterValueVO {
    filterIdColumn: string;
    operators: string;
    filterIdColumnValue: string;
    filterDataType: string;
    repeatableFieldId: string;
}

export class Paginator {
    totalRecords: any;
    pageSize: any;
    index: any;
}
