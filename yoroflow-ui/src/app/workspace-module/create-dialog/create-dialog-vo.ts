
export class WorkspaceVO {
    workspaceId: any;
    workspaceName: string;
    workspaceKey: string;
    workspaceAvatar: string;
    workspaceUniqueId: string;
    securedWorkspaceFlag = false;
    workspaceSecurityVO: AssignTeamVO;
}
export class AssignTeamVO {
    workspaceId: any;
    assignTeamList: TeamNamesVO[];
    removedTeamList: any[];
    assignOwnerList: OwnerNamesVO[];
    removedOwnerList: any[];
  securedWorkspaceFlag: any;
  
}
export class TeamNamesVO {
    id: any;
    name: string;
}

export class OwnerNamesVO {
    id: any;
    name: string;
}
export class WorkspaceListVO {
    workspaceId: any;
    workspaceName: string;
    workspaceKey: string;
    workspaceUniqueId: string;
    securedWorkspaceFlag = false;
    defaultWorkspace: boolean;
    teams: string[];
    owner: string[];
    workspaceSecurityVO: AssignTeamVO;
    workspaceAvatar: string;
    workflow: WorkflowVO;
    taskboard: TaskboardVO;
    selectedWorkspace = false;
    managedWorkspace: boolean;
    update = false;
    isShow = false;
}

export class WorkflowVO {
    workflowCount: any;
    workflowNames: WorkflowListVO[];
}

export class WorkflowListVO {
    processDefinitionId: any;
    processDefinitionName: string;
    processDefinitionVersion: any;

}

export class TaskboardVO {
    taskboardCount: any;
    taskboardNames: string[];
}