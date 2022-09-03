import { YoroGroupsUserVO } from '../shared/vo/yoro-groups-users-vo';

export class Permission {
    id: string;
    tenantId: string;
    securityId: string;
    groupId: string;
    createAllowed = false;
    readAllowed = false;
    updateAllowed = false;
    deleteAllowed = false;
    editAllowed = false;
    showAllowed = false;
    launchAllowed = false;
    pageName: [];
    version: [];
}

export class Security {
    securityId: string;
    deletedIDList: string[] = [];
    permissionsVOList: Permission[];
}

export class YoroGroups {
    id: string;
    tenantId: string;
    name: string;
    description: string;
    yoroGroupsUserVO: YoroGroupsUserVO[] = [];
}
