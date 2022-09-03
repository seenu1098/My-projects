package com.yorosis.authnz.controller;

import java.io.IOException;
import java.util.concurrent.ExecutionException;

import javax.servlet.http.HttpServletRequest;

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
import com.yorosis.authnz.service.GoogleAuthService;
import com.yorosis.authnz.service.MicrosoftAuthService;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.vo.AuthVo;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@RestController
@RequestMapping("/google-auth/v1")
public class GoogleAuthController {

	@Autowired
	private GoogleAuthService googleAuthService;

	@Autowired
	private DomainService domainService;

	@PostMapping("/authenticate")
	public ResponseEntity<AuthVo> login(@RequestBody AuthVo authVo, HttpServletRequest request,
			@RequestHeader("origin") String origin)
			throws YorosisException, IOException, InterruptedException, ExecutionException {
		String header = origin;
		Response response = googleAuthService.verifyGoogleServiceInint(authVo);
		if (response.isSuccessful()) {
			try {
				Customers customers = domainService.getAssignedTenantId(header);
				String tenantId = customers.getTenantId();
				YorosisContext context = YorosisContext.builder().tenantId(tenantId).userName(authVo.getEmail())
						.build();
				YorosisContext.set(context);
				return ResponseEntity.ok(googleAuthService.googleService(authVo, response));
			} finally {
				YorosisContext.clear();
			}
		}
		return ResponseEntity.ok(AuthVo.builder().isValidUser(false).build());
	}

}
