export class Permission {
    id: number;
    tenantId: string;
    securityId: string;
    groupId: number;
    createAllowed = false;
    readAllowed = false;
    updateAllowed = false;
    deleteAllowed = false;
    editAllowed = false;
    showAllowed = false;
    launchAllowed = false;
    pageName: string;
    version: string;
}

export class YoroGroupsUserVO {
    id: number;
    userId: any[];
    groupId: number;
}


export class Security {
    securityId: number;
    deletedIDList: number[] = [];
    permissionsVOList: Permission[];
}

export class YoroGroups {
    id: number;
    tenantId: string;
    name: string;
    description: string;
    yoroGroupsUserVO: YoroGroupsUserVO[] = [];
}
