export class LaunchTaskboardTaskVo {
    totalRecords: number;
    taskVOList: LaunchTaskListVo[] = [];
}

export class LaunchTaskListVo {
    taskId: string;
    instanceId: string;
    taskboardTaskId: string;
    taskboardId: string;
    reqName: string;
    status: string;
    submittedDate: string;
    jsonData: any;
    formId: string;
    version: string;
    assignedToUser: string[] = [];
    assignedToTeam: string[] = [];
}

