export class DashboardVO {
    all: string;
    taskBoard: string;
    workflow: string;
    dueDate: string;
}

export class OverviewVO {
    taskBoardAll: string;
    workflowAll: string;
    dueAll: string;
    taskBoardDueDate: string;
    workflowDueDate: string;
    taskBoardTodo: string;
    taskBoardProgress: string;
    taskBoardDone: string;
    workflowProcess: string;
    workflowCompleted: string;
}
export class TaskboardVO {
    taskboardTaskVo: TaskboardTasksVO[];
    totalRecords: string;
}

export class TaskboardTasksVO {
    id: any;
    taskboardId: any;
    taskId: string;
    boardName: string;
    taskName: string;
    subtasks: string;
    createdDate: string;
    dueDate: string;
    taskboardKey: string;
    commentsCount: string;
    filesCount: string;
    status: string;
    subStatus: string;
    assignedTo: string[];
    statusColor: string;
    subStatusColor: string;
}
export class WorkflowVO {
    workflowTasksVo: WorkflowTasksVO[];
    totalRecords: string;
}
export class WorkflowTasksVO {
    id: any;
    taskName: string;
    createdDate: string;
    dueDate: string;
    viewDetailsButtonName: string;
    assignedTo: string;
    assignedToGroup: string[];
}

export class LatestWorkflowVO {
    id: any;
    workflowName: string;
    workflowKey: string;
    workflowVersion: any;
    launchButtonName: string;
}

export class PaginatorForTaskboard {
    totalRecords: any;
    pageSize: any;
    index: any;
    previousPageIndex: any;
}

export class PaginatorForWorkflow {
    totalRecords: any;
    pageSize: any;
    index: any;
    previousPageIndex: any;
}

export class BoardNameVo {
    taskBoardId: any;
    boardName: string;
    isSelected: boolean = false;
}

export class TaskBoardFilterDataVo {
    statusList: StatusVo[];
    subStatusList: SubStatusVo[];
    boardNameList: BoardNameVo[];
}

export class SubStatusVo {
    subStatus: string;
    color: string;
    isSelected = false;
}

export class StatusVo {
    status: string;
    color: string;
    isSelected = false;
}

export class GroupsVO {
    groupId: any;
    groupName: string;
    groupDesc: string;
    isSelected = false;
}

export class CurrentUserVO {
    userId: any;
    firstName: string;
    lastName: string;
    userName: string;
    emailId: string;
    isSelected = false;
}
export class DashboardPageVO {
    rows: Row[] = [];
}
export class Row {
    row: number;
    rowWidth = '100%';
    totalColumns: number;
    layoutDirection = 'row';
    layoutResponsiveDirection = 'column';
    layoutGap = 20;
    columns: Column[] = [];
    alignment = 'left';
    style?: string;
    rowBackground = '#ffffff';
    totalColumnsWidth: number;
}
export class Column {
    name: string;
    description: string;
    icon: string;
    color: string;
    columnWidth: any = '50%';
    columnHeight: any = '50%';
    content: any;
}

export class DashboardChartVO {
    workspaceIdList: string[] = [];
    taskboardIdList: string[] = [];
    startDate: any;
    endDate: any;
    priority: string;
    filterType: any;
}
