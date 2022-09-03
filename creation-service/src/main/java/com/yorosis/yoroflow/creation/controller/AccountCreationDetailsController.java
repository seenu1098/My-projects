package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;

import javax.mail.MessagingException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stripe.exception.StripeException;
import com.yorosis.yoroapps.vo.AccountDetailsVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.service.ProxyService;

@RestController
@RequestMapping("/account/v1/")
public class AccountCreationDetailsController {

	@Autowired
	private ProxyService proxyService;

	@PostMapping("public/save")
	public ResponseStringVO saveAccountDetails(@RequestBody AccountDetailsVO accountDetailsVO) {
		return proxyService.saveAccountDetails(accountDetailsVO);
	}

	@PostMapping("public/create-account")
	public ResponseStringVO createAccountDetails(@RequestBody AccountDetailsVO accountDetailsVO,
			@RequestHeader(name = "X-Forwarded-For", required = false) String remoteIp)
			throws IOException, YoroappsException, MessagingException, StripeException {
		return proxyService.createAccountDetails(accountDetailsVO, remoteIp);
	}

	@PostMapping("public/check-account")
	public ResponseStringVO checkAccountDetailsToken(@RequestBody AccountDetailsVO accountDetailsVO)
			throws IOException, YoroappsException, MessagingException, StripeException {
		return proxyService.checkAccountDetailsToken(accountDetailsVO);
	}
	
	@GetMapping("/public/check-email/{email}")
	public ResponseStringVO checkAccountDetailsEmail(@PathVariable(name = "email") String email)
			throws IOException, YoroappsException, MessagingException, StripeException {
		return proxyService.checkAccountDetailsEmail(email);
	}

	@GetMapping("/public/check-subdomain/{subDomainName}")
	public ResponseStringVO checkSubdomain(@PathVariable(name = "subDomainName") String subDomainName)
			throws IOException, YoroappsException, MessagingException, StripeException {
		return proxyService.checkSubdomain(subDomainName);
	}
}
