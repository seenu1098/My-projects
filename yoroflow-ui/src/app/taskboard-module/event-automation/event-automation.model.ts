export class AutomationScripts {
    words: string[] = [];
    automation: string;
    keyValuePair: any;
    id: string;
    type: string;
}

export class KeyValuePair {
    keyword: string;
    automationType: string;
    color: string;
    value: any;
    assignee: any;
    automationSubType: string;
}

export class EventAutomationConfigurationVO {
    id: string;
    automation: string;
    automationType: string;
    parentId: string;
    automationSubType: string;
}

export class AutomationVO {
    root = new RootVO();
    conditions: ConditionsVO[] = [];
    applications: string;
}

export class RootVO {
    automationKey: string;
    automationType: string;
    id: string;
    values: string;
}

export class ConditionsVO {
    automationKey: string;
    automationType: string;
    automationSubType: string;
    values: any[];
    data: string;
    id: string;
    actions: ActionsVO[] = [];
    eventSpecificMaps = new EventSpecificMap();
}

export class ActionsVO {
    actionKey: string;
    actionType: string;
    values: any[];
    id: string;
    message: string;
    mappingValues: any;
    yorosisPageId: string;
    subject: string;
    applicationName: string;
    subType: string;
    dataTableName: string;
    actionSpecificMaps = new ActionSpecificMapsVO();
}

export class ActionSpecificMapsVO {
    dataTableName: string;
    subType: string;
    filterValues: any[];
    tableIdentifier:string;
}

export class EventAutomationVO {
    id: string;
    taskboardId: string;
    automation: any;
    isRuleActive: any;
    automationType: string;
}

export class AutomationScriptVO {
    id: string;
    automation: any;
    ruleActive: boolean;
    automationType: string;
    appNameList: string[] = [];
    disabledApps: string[] = [];
}

export class AutomationByCategory {
    categoryName: string;
    automation: string;
    applicationName: string;
}

export class CategoryAutomations {
    categoryName: string;
    automation: string[] = [];
}

export class BoardGroups {
    groupDesc: string;
    groupId: string;
    groupName: string;
}

export class UsersValue {
    user: Users[] = [];
    group: Groups[] = [];
    customUsers: string[] = [];
}

export class GroupValue {
    group: Groups[] = [];
    customUsers: string[] = [];
}

export class Users {
    userName: string;
    userId: string;
}

export class Groups {
    groupName: string;
    groupId: string;
}

export class EventSpecificMap {
    selectedField = new SelectedField();
}

export class SelectedField {
    fieldName: string;
    fieldValue: string;
    fieldType: string;
    status: string;
}