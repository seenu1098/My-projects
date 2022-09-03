import { AuthConfig } from 'angular-oauth2-oidc';
import { OrganizationIntegratedAppsVO } from '../taskboard-module/integrate-application/integrate-application.vo';

export class SlackConfig extends AuthConfig {
    constructor(integratedAppConfig: OrganizationIntegratedAppsVO) {
        super();
        this.issuer = integratedAppConfig.issuer;
        this.loginUrl = integratedAppConfig.authorizationUrl;
        this.clientId = integratedAppConfig.clientId;
        this.responseType =  'code';
        this.redirectUri = integratedAppConfig.redirectUrl;
        this.nonceStateSeparator = 'semicolon';
        this.oidc = false;
        this.setScopeAndCustomScope(integratedAppConfig);
    }

    private setScopeAndCustomScope(integratedAppConfig: OrganizationIntegratedAppsVO): void {
        const scopeList = [];
        const customScopeList = [];
        integratedAppConfig?.scopes.split(',')?.forEach((scope) => {
            scope = scope.trim();
            if (scope === 'openid' || scope === 'profile' || scope === 'email') {
                customScopeList.push(scope);
            } else {
                scopeList.push(scope);
            }
        });
        if (customScopeList.length > 0) {
            this.customQueryParams = {
                user_scope: customScopeList.join(',')
            };
        }
        if (scopeList.length > 0) {
            this.scope = scopeList.join(',');
        }    
    }
}
