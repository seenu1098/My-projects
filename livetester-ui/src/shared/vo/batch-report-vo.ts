export class BatchReportVO {
    fromDate: Date;
    toDate: Date;
    batchNames: string[];
    response: string;
    reportType: string;
    testReportVOList: BatchGenerateVO[];
    createdDate: Date;
}

export interface BatchGenerateVO {
    name: string;
    data: number[];
}
