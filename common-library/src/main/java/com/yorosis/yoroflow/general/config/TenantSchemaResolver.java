package com.yorosis.yoroflow.general.config;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.stereotype.Component;

import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Component
public class TenantSchemaResolver implements CurrentTenantIdentifierResolver {

	@Override
	public String resolveCurrentTenantIdentifier() {
		if (YorosisContext.get() != null && StringUtils.isNotBlank(YorosisContext.get().getTenantId())) {
			return YorosisContext.get().getTenantId();
		}

		return YorosisConstants.DEFAULT_SCHEMA;
	}

	@Override
	public boolean validateExistingCurrentSessions() {
		return true;
	}

}
