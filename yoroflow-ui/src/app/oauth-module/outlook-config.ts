import { AuthConfig } from 'angular-oauth2-oidc';
import { OrganizationIntegratedAppsVO } from '../taskboard-module/integrate-application/integrate-application.vo';

export class OutlookConfig extends AuthConfig {
    constructor(integratedAppConfig: OrganizationIntegratedAppsVO) {
        super();
        this.issuer = integratedAppConfig.issuer;
        this.loginUrl = integratedAppConfig.authorizationUrl;
        this.clientId = integratedAppConfig.clientId;
        this.responseType =  'code';
        this.redirectUri = integratedAppConfig.redirectUrl;
        this.nonceStateSeparator = 'semicolon';
        this.oidc = false;
        this.disablePKCE = true;
        this.scope = integratedAppConfig?.scopes?.split(',').map((scope) => scope.trim()).join(' ');
    }   
}