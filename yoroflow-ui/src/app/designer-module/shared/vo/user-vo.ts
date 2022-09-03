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
}

export interface RolesListVO {
    id: number;
    rolesNames: string;
}

