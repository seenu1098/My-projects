package com.yorosis.taskboard.services.outh.handler;

import java.util.Optional;

import org.apache.commons.lang3.StringUtils;

import com.google.common.base.Preconditions;
import com.yorosis.taskboard.taskboard.entities.OrganizationIntegratedApps;
import com.yorosis.yoroapps.vo.OauthToken;

public class OauthHandler {
    private OauthScribeBaseService oauthService;

    public OauthHandler(final OrganizationIntegratedApps appConfigs) {
        Preconditions.checkArgument(appConfigs  != null, "Organization integrated apps is " +
                "required here");
        this.oauthService = OauthScribeServiceCreator.getOauthScribeService(appConfigs);
    }

    public Optional<OauthToken> exchangeAuthorizationCodeForToken(final String authorizationCode) {
        Preconditions.checkArgument(StringUtils.isNotBlank(authorizationCode));
        return this.oauthService.exchangeAuthorizationCodeForToken(authorizationCode);
    }
}
