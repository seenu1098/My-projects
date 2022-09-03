export class PageFieldVO {
    fieldId: string;
    fieldName: string;
    datatype: string;
    taskType: string;
    repeatableFieldName: string;
    repeatableFieldId: string;
    dateFormat: string;
    color: string;
}

export class PageFieldVo {
    fieldType: string;
    fieldVO: PageFieldVO[] = [];
}

export class TimeZoneVo {
    timeZoneCode: string;
    timeZoneLabel: string;
    defaultTimeZone: string;
    id: any;
}

export class SMSKeyWorkflowVO {
    id: any;
    providerName: string;
}


export class remainderForm {
    remainderType: string;
    remainderLevel: string;
    reminderTime: string;
    reminderUnits: string;
    smsNotification: any;
    emailNotification: any
}

export class remainderDetails {
    remainderDetails: remainderForm[];
}