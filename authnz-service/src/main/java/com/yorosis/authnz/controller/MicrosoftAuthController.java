package com.yorosis.authnz.controller;

import java.io.IOException;
import java.util.concurrent.ExecutionException;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.github.scribejava.core.model.Response;
import com.yorosis.authnz.exception.YorosisException;
import com.yorosis.authnz.service.DomainService;
import com.yorosis.authnz.service.MicrosoftAuthService;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.vo.AuthVo;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@RestController
@RequestMapping("/microsoft-auth/v1")
public class MicrosoftAuthController {
	@Autowired
	private MicrosoftAuthService microsoftAuthService;

	@Autowired
	private DomainService domainService;

	@PostMapping("/authenticate/microsoft")
	public ResponseEntity<AuthVo> loginMicrosoft(@RequestBody AuthVo authVo, HttpServletRequest request,
			@RequestHeader("origin") String origin)
			throws YorosisException, IOException, InterruptedException, ExecutionException {
		String header = origin;
		if (StringUtils.equals(authVo.getLoginType(), "azure")) {
			try {
				Customers customers = domainService.getAssignedTenantId(header);
				String tenantId = customers.getTenantId();
				YorosisContext context = YorosisContext.builder().tenantId(tenantId).userName(authVo.getEmail())
						.build();
				YorosisContext.set(context);
				return ResponseEntity.ok(microsoftAuthService.microsoftServiceByAzure(authVo));
			} finally {
				YorosisContext.clear();
			}
		} else {
			Response response = microsoftAuthService.verifyMicrosoftServiceInit(authVo);
			if (response.isSuccessful()) {
				try {
					Customers customers = domainService.getAssignedTenantId(header);
					String tenantId = customers.getTenantId();
					YorosisContext context = YorosisContext.builder().tenantId(tenantId).userName(authVo.getEmail())
							.build();
					YorosisContext.set(context);
					return ResponseEntity.ok(microsoftAuthService.microsoftService(authVo, response));
				} finally {
					YorosisContext.clear();
				}
			}
		}
		return ResponseEntity.ok(AuthVo.builder().tokenId("Failed").isValidUser(false).build());
	}

}
