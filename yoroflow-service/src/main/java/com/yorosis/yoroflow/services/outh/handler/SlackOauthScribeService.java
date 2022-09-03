package com.yorosis.yoroflow.services.outh.handler;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.github.scribejava.core.oauth.AccessTokenRequestParams;
import org.apache.commons.lang3.StringUtils;

import com.github.scribejava.apis.SlackApi;
import com.github.scribejava.core.builder.ServiceBuilder;
import com.google.common.base.Preconditions;
import com.yorosis.yoroflow.entities.OrganizationIntegratedApps;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class SlackOauthScribeService extends OauthScribeBaseService {

    public SlackOauthScribeService(final OrganizationIntegratedApps appConfigs) {
        super(appConfigs);
        this.oauth20Service = new ServiceBuilder(appConfigs.getClientId())
                .apiSecret(appConfigs.getClientSecret())
                .build(SlackApi.instance());
    }
    @Override
    public List<String> getScopes(final String scopesCsv) {
        Preconditions.checkArgument(StringUtils.isNotBlank(scopesCsv));
        return Stream.of(scopesCsv.split(","))
                .map((scope) -> scope = StringUtils.deleteWhitespace(scope))
                .filter((scope) -> {
                    return !StringUtils.equalsIgnoreCase("openid", scope)
                    && !StringUtils.equalsIgnoreCase("profile", scope)
                    && !StringUtils.equalsIgnoreCase("email", scope);
                }).collect(Collectors.toList());
    }
}
