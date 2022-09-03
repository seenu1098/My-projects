export class AppIntegrationVO {
    applicationName: string;
    description: string;
}

export class OrganizationIntegratedAppsVO {
    applicationName: string;
    id: string;
    authType: string;
    authToken: string;
    apiKey: string;
    apiSecret: string;
    clientId: string;
    clientSecret: string;
    isRemoved: string;
    remove: boolean;
    authorizationUrl: string;
    scopes: string;
    issuer: string;
    redirectUrl: string;
}