export class ProcessInstanceListVO {
    processInstanceId: string;
    procesDefName: string;
    startDate: string;
    updatedTime: string;
    status: string;
    totalTimeTaken: string;
}

export class ProcessHeadersVo {
    headerName: string;
    headerId: string;
    headerDetails: any;
    style: any;
}

export class Paginator {
    totalRecords: any;
    pageSize: any;
    index: any;
}
