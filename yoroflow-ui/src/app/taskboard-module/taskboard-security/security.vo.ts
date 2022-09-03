export class TaskboardSecurityVO {
  deletedIDList: string[] = [];
  deletedColumnsIDList: string[] = [];
  securityList: SecurityListVO[];
  columnSecurityList: TaskboardColumnSecurityVO[];
  taskboardId: string;
  taskboardOwner: string[] = [];
  isTaskBoardOwner: boolean;
  deletedOwnerIdList: string[] = [];
}
export class SecurityListVO {
  id: string;
  groupId: string;
  readAllowed: boolean;
  updateAllowed: boolean;
  deleteAllowed: boolean;
}

export class ColumnSecurityListVO {
  id: string;
  groupId: string;
  readAllowed: boolean;
  deleteAllowed: boolean;
  updateAllowed: boolean;
}

export class TaskboardColumnSecurityVO {
  columnId: string;
  columnPermissions: ColumnSecurityListVO[];
}

export class YoroGroups {
  id: number;
  tenantId: string;
  name: string;
  description: string;
  yoroGroupsUserVO: YoroGroupsUserVO[] = [];
}
export class YoroGroupsUserVO {
  id: number;
  userId: any[];
  groupId: number;
}

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
