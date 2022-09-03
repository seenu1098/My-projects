package com.yorosis.taskboard.services.outh.handler;

import com.github.scribejava.apis.MicrosoftAzureActiveDirectory20Api;
import com.github.scribejava.core.builder.ServiceBuilder;
import com.yorosis.taskboard.taskboard.entities.OrganizationIntegratedApps;

public class MicrosoftOauthScribeService extends OauthScribeBaseService {
	public MicrosoftOauthScribeService(final OrganizationIntegratedApps orgIntegratedApps) {
		super(orgIntegratedApps);
		this.oauth20Service = new ServiceBuilder(orgIntegratedApps.getClientId())
				.apiSecret(orgIntegratedApps.getClientSecret()).build(MicrosoftAzureActiveDirectory20Api.instance());
	}
}
