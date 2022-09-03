import { AuthConfig } from "angular-oauth2-oidc";

export const authConfig: AuthConfig = {
    issuer: 'https://login.microsoftonline.com/common/v2.0/',
    loginUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    redirectUri: 'http://localhost:4200/en/single-signon/return',
    clientId: 'ea0e7f19-334e-42a0-be77-120ad6619853',
    responseType: 'code',
    scope: 'openid profile email offline_access',
    showDebugInformation: true,
    timeoutFactor: 0.01,
    strictDiscoveryDocumentValidation: false,
    skipIssuerCheck: true,
}