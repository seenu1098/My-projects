export class UserVO {
    userId: any;
    firstName: string;
    lastName: string;
    userName: string;
    emailId: string;
}

export class GroupVO {
    groupId: any;
    groupName: string;
    groupDesc: string;
}

export class EmitVO {
    user = new UserVO();
    multiUsers: UserVO[] = [];
    group = new GroupVO();
    multiGroups: GroupVO[] = [];
    customUsers: string[] = [];
}