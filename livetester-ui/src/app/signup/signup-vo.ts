export class User {
    userId: number;
    firstName: string;
    lastName: string;
    userName: String;
    emailId: string;
    password: string;
    roleId: number[];
    userRole: RolesListVO[];
    globalSpecification: string;
}

export interface RolesListVO {
    id: number;
    rolesNames: string;
}
