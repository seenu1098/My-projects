package com.yorosis.yoroflow.services.outh.handler;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.github.scribejava.core.builder.ScopeBuilder;
import com.github.scribejava.core.oauth.AccessTokenRequestParams;
import org.apache.commons.lang3.StringUtils;

import com.github.scribejava.core.model.OAuth2AccessToken;
import com.github.scribejava.core.oauth.OAuth20Service;
import com.google.common.base.Preconditions;
import com.yorosis.yoroapps.vo.OauthToken;
import com.yorosis.yoroflow.entities.OrganizationIntegratedApps;

import lombok.extern.slf4j.Slf4j;
@Slf4j
public abstract class OauthScribeBaseService {
    protected OrganizationIntegratedApps appConfigs;
    protected OAuth20Service oauth20Service;

    protected OauthScribeBaseService(final OrganizationIntegratedApps appConfigs) {
        this.checkOrganizationIntegratedApps(appConfigs);
        this.appConfigs = appConfigs;
    }

    private void checkOrganizationIntegratedApps(final OrganizationIntegratedApps orgIntegratedApps) {
        Preconditions.checkArgument(orgIntegratedApps != null);
        Preconditions.checkArgument(StringUtils.isNotBlank(orgIntegratedApps.getClientId()));
        Preconditions.checkArgument(StringUtils.isNotBlank(orgIntegratedApps.getClientSecret()));
    }

    public Optional<OauthToken> exchangeAuthorizationCodeForToken(final String authorizationCode) {
        Preconditions.checkArgument(StringUtils.isNotBlank(authorizationCode));
        try {
            AccessTokenRequestParams accessTokenRequestParams = getAccessRequestParams(authorizationCode);
            return Stream.of(this.oauth20Service.getAccessToken(accessTokenRequestParams))
                    .map(accessToken -> {
                        return this.createFromScribeAccessToken(accessToken);
                    })
                    .findFirst()
                    .orElse(Optional.empty());
        } catch (Exception exception){
            log.error("Failed to get access_token for {}", this.appConfigs.getAppName(), exception);
            return Optional.empty();
        }
    }

    protected List<String> getScopes(final String scopesCsv) {
        Preconditions.checkArgument(StringUtils.isNotBlank(scopesCsv));
        return Stream.of(scopesCsv.split(","))
                .map((scope) -> scope = StringUtils.deleteWhitespace(scope))
                .collect(Collectors.toList());
    }

    protected AccessTokenRequestParams getAccessTokenRequestParams(String authorizationCode) {
        AccessTokenRequestParams accessTokenRequestParams =
                AccessTokenRequestParams.create(authorizationCode);
        accessTokenRequestParams.addExtraParameter("redirect_uri", this.appConfigs.getRedirectUrl());
        return accessTokenRequestParams;
    }

    private AccessTokenRequestParams getAccessRequestParams(String authorizationCode) {
        AccessTokenRequestParams accessTokenRequestParams =
                this.getAccessTokenRequestParams(authorizationCode);
        List<String> scopeCollection = this.getScopes(this.appConfigs.getScopesCsv());
        ScopeBuilder scopeBuilder = new ScopeBuilder(scopeCollection);
        accessTokenRequestParams.scope(scopeBuilder);
        return accessTokenRequestParams;
    }

    private Optional<OauthToken> createFromScribeAccessToken(final OAuth2AccessToken scribeAccessToken) {
        log.info("Token exchange successful for {}", this.appConfigs.getAppName());
        return Optional.of(OauthToken.builder().
                accessToken(scribeAccessToken.getAccessToken()).
                refreshToken(scribeAccessToken.getRefreshToken()).
                expiresInSeconds(scribeAccessToken.getExpiresIn()).
                scope(scribeAccessToken.getScope()).
                build());
    }
}
