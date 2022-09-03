package com.yorosis.yoroflow.services.outh.handler;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.apache.commons.lang3.StringUtils;

import com.google.common.base.Preconditions;
import com.yorosis.yoroflow.entities.OrganizationIntegratedApps;

public class OauthScribeServiceCreator {
	private static final Map<String, Function<OrganizationIntegratedApps, OauthScribeBaseService>> oauthServiceSupplierMap = new HashMap<>();

	static {
		oauthServiceSupplierMap.put("Slack", (appConfigs) -> new SlackOauthScribeService(appConfigs));
		oauthServiceSupplierMap.put("Microsoft Teams", (appConfigs) -> new MicrosoftOauthScribeService(appConfigs));
		oauthServiceSupplierMap.put("Outlook", (appConfigs) -> new MicrosoftOauthScribeService(appConfigs));
	}

	public static OauthScribeBaseService getOauthScribeService(OrganizationIntegratedApps appConfigs) {
		Preconditions.checkNotNull(appConfigs, "App configs is required here");
		Preconditions.checkArgument(StringUtils.isNotBlank(appConfigs.getAppName()), "App Name is" + " required here");
		Preconditions.checkArgument(oauthServiceSupplierMap.containsKey(appConfigs.getAppName()),
				"No Service exists for app name:" + appConfigs.getAppName());
		var serviceCreatorFunction = oauthServiceSupplierMap.get(appConfigs.getAppName());
		return serviceCreatorFunction.apply(appConfigs);
	}
}
