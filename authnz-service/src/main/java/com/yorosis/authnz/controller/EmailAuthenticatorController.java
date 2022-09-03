package com.yorosis.authnz.controller;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.authnz.exception.YorosisException;
import com.yorosis.authnz.service.DomainService;
import com.yorosis.authnz.service.EmailAuthenticatorService;
import com.yorosis.authnz.vo.QrDetailsVo;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import dev.samstevens.totp.exceptions.QrGenerationException;

@RestController
@RequestMapping("/email-auth/v1/")
public class EmailAuthenticatorController {

	@Autowired
	private DomainService domainService;

	@Autowired
	private EmailAuthenticatorService emailAuthenticatorService;

	@PostMapping("qr/setup")
	public QrDetailsVo setupDevice(@RequestBody QrDetailsVo qrDetails, @RequestHeader("origin") String origin)
			throws QrGenerationException, YorosisException {
		String header = StringUtils.lowerCase(StringUtils.trim(origin));
		try {
			if (!StringUtils.equals(qrDetails.getSecret(), "verify")) {
				Customers customers = domainService.getAssignedTenantId(header);
				String tenantId = customers.getTenantId();
				YorosisContext context = YorosisContext.builder().tenantId(tenantId).build();
				YorosisContext.set(context);
			}
			return emailAuthenticatorService.emailQrSetup(qrDetails);
		} finally {
			YorosisContext.clear();
		}
	}

	@PostMapping("/qr/validate-otp")
	public ResponseStringVO checkTwoFactor(@RequestBody QrDetailsVo qrDetails, @RequestHeader("origin") String origin)
			throws QrGenerationException, YorosisException {
		String header = StringUtils.lowerCase(StringUtils.trim(origin));
//		String header="https://yorosis.yoroflow.com";
		try {
			Customers customers = domainService.getAssignedTenantId(header);
			String tenantId = customers.getTenantId();
			YorosisContext context = YorosisContext.builder().tenantId(tenantId).build();
			YorosisContext.set(context);
			return emailAuthenticatorService.checkOtp((qrDetails));
		} finally {
			YorosisContext.clear();
		}

	}

}
