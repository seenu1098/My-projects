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
    color: string;
    isSelected: boolean;
}

export interface RolesListVO {
    id: number;
    rolesNames: string;
}

