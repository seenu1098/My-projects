
package com.yorosis.yoroflow.schedule.services;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.models.ServiceTokenVO;
import com.yorosis.yoroflow.request.filter.client.AuthDetailsVO;
import com.yorosis.yoroflow.request.filter.client.AuthnzServiceClient;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.services.ServiceTokenHandlerService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SchedulerService {
	private static final String TOKEN_PREFIX = "Bearer ";
	@Autowired
	private SchedulerMultiTenancyService multiTenancyService;

	@Autowired
	private ServiceTokenHandlerService serviceTokenHandlerService;

	@Autowired
	private AuthnzServiceClient authnzServiceClient;

	@Transactional
	public int getMaxCustomerId() {
		return multiTenancyService.getMaxTenantId();
	}

	@Transactional
	public YorosisContext getDefaultTokenContext(String tenantId) {
		String defaultAdminUser = multiTenancyService.getDefaultAdminUser(tenantId);
		try {
			YorosisContext context = YorosisContext.builder().tenantId(tenantId).userName(defaultAdminUser).build();
			YorosisContext.set(context);
			ServiceTokenVO serviceTokenVO = serviceTokenHandlerService.loadServiceTokenByUserName(YorosisContext.get().getUserName());

			if (serviceTokenVO == null || StringUtils.isBlank(serviceTokenVO.getApiKey())) {
				log.warn("Invalid API key.  Please create the default API Key/Secret for the default user.  Tenant id: {}", tenantId);
				return null;
			}

			AuthDetailsVO authDetailsVo = authnzServiceClient.authenticateToken("token", serviceTokenVO.getApiKey(), serviceTokenVO.getSecretKey());
			if (authDetailsVo != null) {
				String token = TOKEN_PREFIX.concat(authDetailsVo.getToken());
				return YorosisContext.builder().tenantId(tenantId).token(token).userName(defaultAdminUser).build();
			}

			return null;
		} finally {
			YorosisContext.clear();
		}
	}
}
