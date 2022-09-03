export class CustomAttributeListVO {
    id: string;
    name: string;
    value: string;
    dataType: string;
    size: number;
    required: any;
    attributeType: string;
}

export class CustomAttributeVO {
    customAttributeListVo: CustomAttributeListVO[];
    deletedColumnIDList: any[];
    subdomainName: any;
}

export class FieldName {
    index: number;
    value: string;
}

export class AllowAuthentication {
    authenticationArray: AuthenticationArray[];
    subdomainName: string;
}

export class TwoFactorAuthentication {
    enableTwoFactor: boolean;
    twoFactorsList: string[];
    selectedTwofactorsList: string[];
    subdomainName: string;
}

export class AuthenticationArray {
    id: any;
    authProvider: string;
    isAuthProvider: boolean;
    selectDomainType: string;
    allowedDomain: any[];
    clientId: string;
    secretId: string;
    tenantId: string;
    allowedGroupType: string;
    allowedGroup: any[];
}

export interface PlaceholderForAuth {
    name: string;
    index: any;
  }

