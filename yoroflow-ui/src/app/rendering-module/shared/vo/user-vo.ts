// export class UserVO {
//     userId: string;
//     userName: string;
//     firstName: string;
//     lastName: string;
//     emailId: string;
//     password: string;
//     // roleId: number[];
//     userRole: RolesListVO[];
//     globalSpecification: string;
//     profilePicture: string;
// }

export class UserVO {
    userId: string;
    userName: string;
    firstName: string;
    lastName: string;
    emailId: string;
    password: string;
    //roleId: number[];
    userType: string;
    userRole: RolesListVO[];
    globalSpecification: string;
    unReadMessageCount: number;
    lastMessage: string;
    lastMessageTime: any;
    profilePicture: string;
    groupVOList: GroupVO[];
    theme: string;
    layout: string;
    defaultLanguage: string;
    additionalSettings = new AdditionalSettings();
    color: string;
}

export class AdditionalSettings {
    fontSize: string;
}

export class GroupVO {
    groupId: any;
    groupName: string;
    groupDesc: string;
}

// export interface RolesListVO {
//     id: string;
//     rolesNames: string;
// }

export interface RolesListVO {
    id: number;
    rolesNames: string;
}

export class UserIdListVO {
    userIdList: any[] = [];
}

export class NotificationVO {
    id: any;
    fromId: any;
    toId: any;
    message: string;
    fromUserName: string;
    taskId: any;
    readTime: any;
    fromUserProfilePicture: string;
    groupId: any;
    link: string;
    taskboardId: string;
    taskboardTaskId: string;
    type: string;
}


