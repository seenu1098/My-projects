export class UserVO {
    userId: string;
    userName: string;
    firstName: string;
    lastName: string;
    emailId: string;
    contactEmailId: string;
    password: string;
    roleId: string[];
    userRole: RolesListVO[];
    globalSpecification: string;
    profilePicture: FormData;
    tenantId: string;
    mobileNumber: string;
    theme: string;
    layout: string;
    defaultLanguage: string;
    additionalSettings = new AdditionalSettings();
    color: string;
    timezone: string;
}

export class AdditionalSettings {
    fontSize: string;
}

export interface RolesListVO {
    id: string;
    rolesNames: string;
}

