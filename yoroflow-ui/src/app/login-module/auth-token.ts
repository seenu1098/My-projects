export interface AuthToken {
    token: string;
    subDomainName: string;
    message: string;
    userName: string;
}

export class AuthTokenVo {
    token: string;
    subDomainName: string;
    message: string;
    userName: string;
}
