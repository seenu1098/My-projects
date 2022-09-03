package com.yorosis.yoroflow.services.outh.handler;

import com.github.scribejava.apis.MicrosoftAzureActiveDirectory20Api;
import com.github.scribejava.core.builder.ServiceBuilder;
import com.github.scribejava.core.oauth.AccessTokenRequestParams;
import com.yorosis.yoroflow.entities.OrganizationIntegratedApps;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class MicrosoftOauthScribeService extends OauthScribeBaseService {
    public MicrosoftOauthScribeService(final OrganizationIntegratedApps orgIntegratedApps) {
        super(orgIntegratedApps);
        this.oauth20Service = new ServiceBuilder(orgIntegratedApps.getClientId())
                .apiSecret(orgIntegratedApps.getClientSecret())
                .build(MicrosoftAzureActiveDirectory20Api.instance());
    }
}
