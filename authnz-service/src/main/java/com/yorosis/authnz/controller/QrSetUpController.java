package com.yorosis.authnz.controller;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yorosis.authnz.exception.YorosisException;
import com.yorosis.authnz.service.AuthenticationService;
import com.yorosis.authnz.service.DomainService;
import com.yorosis.authnz.service.QrSetUpService;
import com.yorosis.authnz.vo.QrDetailsVo;
import com.yorosis.yoroapps.entities.Customers;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.SigninUserVO;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import dev.samstevens.totp.exceptions.QrGenerationException;

@RestController
@RequestMapping("/qr-service/v1")
public class QrSetUpController {

	@Autowired
	private QrSetUpService qrSetUpService;

	@Autowired
	private DomainService domainService;

	@Autowired
	private AuthenticationService authService;

	@GetMapping("/qr/setup/{userId}")
	public QrDetailsVo setupDevice(@PathVariable("userId") String userId, @RequestHeader("referer") String origin)
			throws QrGenerationException, YorosisException {
		if (StringUtils.contains(origin, "localhost")) {
			origin = "https://india.yoroflow.com";
		}
		String header = StringUtils.lowerCase(StringUtils.trim(origin));
		String[] arrOfStr = header.split("//", 2);
		String[] url = arrOfStr[1].split("[.]", 2);
		String domain = url[0].toString();
		try {
			Customers customers = domainService.getAssignedTenantId(header);
			String tenantId = customers.getTenantId();
			YorosisContext context = YorosisContext.builder().tenantId(tenantId).build();
			YorosisContext.set(context);
			return qrSetUpService.qrSetUp(userId, domain);
		} finally {
			YorosisContext.clear();
		}

	}

	@PostMapping("/check-qr")
	public ResponseStringVO checkHasTwoFactor(@RequestBody QrDetailsVo qrDetails,
			@RequestHeader("origin") String origin) throws YorosisException {
		String header = StringUtils.lowerCase(StringUtils.trim(origin));
		try {
			Customers customers = domainService.getAssignedTenantId(header);
			String tenantId = customers.getTenantId();
			YorosisContext context = YorosisContext.builder().userName(qrDetails.getUserName()).tenantId(tenantId)
					.build();
			YorosisContext.set(context);
			return qrSetUpService.checkTwoFactor(qrDetails, customers);
		} finally {
			YorosisContext.clear();
		}

	}

	@PostMapping("/qr/validate-otp")
	public QrDetailsVo checkTwoFactor(@RequestBody QrDetailsVo qrDetails, @RequestHeader("origin") String origin)
			throws QrGenerationException, YorosisException {
		String header = StringUtils.lowerCase(StringUtils.trim(origin));
		try {
			if (!StringUtils.equals(qrDetails.getIsCheck(), "verify")
					|| !StringUtils.equals(qrDetails.getIsCheck(), "save")) {
				Customers customers = domainService.getAssignedTenantId(header);
				String tenantId = customers.getTenantId();
				YorosisContext context = YorosisContext.builder().tenantId(tenantId).build();
				YorosisContext.set(context);
			}
			return qrSetUpService.checkSetUpOtp((qrDetails));
		} finally {
			YorosisContext.clear();
		}

	}

	@PostMapping("/authenticate")
	public ResponseEntity<ResponseStringVO> login(@RequestBody SigninUserVO userVo, HttpServletRequest request,
			@RequestHeader("origin") String origin) throws YorosisException {
		String header = StringUtils.lowerCase(StringUtils.trim(origin));
		try {
			Customers customers = domainService.getAssignedTenantId(header);
			String tenantId = customers.getTenantId();
			YorosisContext context = YorosisContext.builder().tenantId(tenantId).userName(userVo.getUsername()).build();
			YorosisContext.set(context);
			userVo.setUsername(userVo.getUsername().trim().toLowerCase());
			return ResponseEntity.ok(authService.authenticateForQr(userVo));
		} finally {
			YorosisContext.clear();
		}
	}
}
