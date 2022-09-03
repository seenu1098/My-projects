

export class Permission {
    id: number;
    tenantId: string;
    securityId: number;
    groupId: any;
    groupName: string;
    createAllowed = false;
    readAllowed = false;
    updateAllowed = false;
    deleteAllowed = false;
    launchAllowed = false;
    publishAllowed = false;
}

export class Security {
    securityId: any;
    deletedIDList: number[] = [];
    permissionsVOList: Permission[];
}

export class YoroGroups {
    groupId: any;
    tenantId: string;
    groupName: string;
    groupDesc: string;
    yoroGroupsUserVO: YoroGroupsUserVO[] = [];
}

export class YoroGroupsUserVO {
    id: number;
    userId: any[];
    groupId: number;
    userCount: number;
    ownerId: any[];
    owners: any[];
    members: any[];
    ownersList: any[];
    membersList: any[];
    groups: GroupVO[];
    name:string;
    isSelected:boolean = false;
    filter:boolean = false;
}

export class GroupVO {
    id: any;
    owners: any[];
    members: any[];
  }
