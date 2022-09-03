import { AuthConfig } from 'angular-oauth2-oidc';
import { OrganizationIntegratedAppsVO } from '../taskboard-module/integrate-application/integrate-application.vo'
import { MicrosoftTeamsConfig } from './microsoft-teams-config';
import { SlackConfig } from './slack-config';

type AuthConfigFn = (integratedAppConfig: OrganizationIntegratedAppsVO) => AuthConfig;

export class OauthConfigCreator {
    private static appToConfigMap: Record<string, AuthConfigFn> = {
        Slack: (integratedAppConfig) => new SlackConfig(integratedAppConfig),
        'Microsoft Teams': (integratedAppConfig) => new MicrosoftTeamsConfig(integratedAppConfig),
        'Outlook':(integratedAppConfig)=>new MicrosoftTeamsConfig(integratedAppConfig)
    };

    createAuthConfig(integratedAppConfig: OrganizationIntegratedAppsVO): AuthConfig {
        const appName = integratedAppConfig?.applicationName;
        if (!OauthConfigCreator.appToConfigMap[appName]){
            throw new Error(`No config found for app ${appName}`);
        }
        return OauthConfigCreator.appToConfigMap[appName](integratedAppConfig);
    }
}
