export class WorkFlowList {
    processDefinitionId: any;
    key: string;
    processDefinitionName: string;
    workflowVersion: any;
    canEdit = 'n';
    canLaunch = 'n';
    canPublish = 'n';
    enablePin: boolean;
    launchButtonName: string;
    status: string;
    workspaceId: any;
}

export class EnablePin {
    processDefinitionKey: any;
    enablePin: boolean;
}
