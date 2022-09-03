export class UserVO {
    userId: string;
    userName: string;
    firstName: string;
    lastName: string;
    emailId: string;
    contactEmailId: string;
    password: string;
    //roleId: number[];
    userType: string;
    userRole: RolesListVO[];
    globalSpecification: string;
    unReadMessageCount: number;
    recipientEmails: string;
    senderEmail: string;
    subject: string;
    messageBody: string;
    inviteUser: string;
    mobileNumber: string;
    groupId: any[];
    roleId: any[];
    activeFlag: string;
    removedGroupIdList: any[] = [];
    removedRolesIdList: any[] = [];
    userRoleList: any[] = [];
    isRoleEditable: boolean;
    color:string;
}

export interface RolesListVO {
    id: number;
    rolesNames: string;
}

export class EmailRequestVO {
    recipientEmails: string;
    senderEmail: string;
    subject: string;
    messageBody: string;
    inviteUser: boolean;
}

export class Paginator {
    totalRecords: any;
    pageSize: any;
    index: any;
    previousPageIndex: any;
}

export class EnableTwoFactorVO {
    userIdList: string[] = [];
    isEnableAll: boolean;
}