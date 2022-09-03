package com.yorosis.yoroflow.request.filter.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "authnz-service", url = "${authnz-service.base.url}")
public interface AuthnzServiceClient {
	@GetMapping(value = "/user-service/v1/validate-token/{token}", consumes = "application/json")
	public AuthDetailsVO authenticateToken(@PathVariable(name = "token") String token, @RequestHeader("x-api-key") String apiKey,
			@RequestHeader("x-secret-key") String secretKey);

	@GetMapping(value = "/user-service/v1/validate-token/{token}", consumes = "application/json")
	public AuthDetailsVO authenticateToken(@PathVariable(name = "token") String token);

	@GetMapping(value = "/user-service/v1/get-captcha/{response}/{version}")
	public Boolean verifyInfo(@PathVariable(name = "response") String response, @PathVariable(name = "version") Long version);
}
