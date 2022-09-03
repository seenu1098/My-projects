package com.yorosis.yoroflow.request.filter.client.interceptor;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import feign.RequestInterceptor;
import feign.RequestTemplate;

@Component
public class FeignClientHeaderInterceptor implements RequestInterceptor {

	public static final String AUTHORIZATION_HEADER = "Authorization";
	public static final String YOROFLOW_REQUEST_ID_HEADER = "x-yoroflow-request-id";

	@Override
	public void apply(RequestTemplate requestTemplate) {
		YorosisContext yorosisContext = YorosisContext.get();
		if (yorosisContext != null) {
			String token = yorosisContext.getToken();
			String requestId = yorosisContext.getRequestId();

			if (StringUtils.isNotBlank(token)) {
				requestTemplate.header(AUTHORIZATION_HEADER, String.format("%s", token));
			}

			if (StringUtils.isNotBlank(requestId)) {
				requestTemplate.header(YOROFLOW_REQUEST_ID_HEADER, String.format("%s", requestId));
			}
		}
	}

}
