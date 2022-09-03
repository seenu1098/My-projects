package com.yorosis.authnz.controller;

import java.util.Enumeration;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.yorosis.authnz.service.TermsAndConditionsService;
import com.yorosis.yoroapps.vo.ResponseStringVO;

@RestController
@RequestMapping("/terms/v1/")
public class TermsAndConditionsController {
	private static final String[] IP_HEADER_CANDIDATES = { "X-Forwarded-For", "Proxy-Client-IP", "WL-Proxy-Client-IP", "HTTP_X_FORWARDED_FOR",
			"HTTP_X_FORWARDED", "HTTP_X_CLUSTER_CLIENT_IP", "HTTP_CLIENT_IP", "HTTP_FORWARDED_FOR", "HTTP_FORWARDED", "HTTP_VIA", "REMOTE_ADDR" };

	@Autowired
	private TermsAndConditionsService termsAndConditionsService;

	@GetMapping("/save")
	public ResponseStringVO saveOrgTerms() {
		String remoteIp = getClientIpAddressIfServletRequestExist();
		if (StringUtils.isBlank(remoteIp)) {
			remoteIp = "0.0.0.0";
		}
		
		return termsAndConditionsService.saveOrgTerms(remoteIp);
	}

	private String getClientIpAddressIfServletRequestExist() {
		RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
		if (requestAttributes == null) {
			return "0.0.0.0";
		}

		HttpServletRequest request = ((ServletRequestAttributes) requestAttributes).getRequest();
		Enumeration<String> headerNames = request.getHeaderNames();
		while (headerNames.hasMoreElements()) {
			String header = headerNames.nextElement();
			System.out.println("###" + header + "####" + request.getHeader(header) + "###");
		}
		
		for (String header : IP_HEADER_CANDIDATES) {
			String ipAddress = request.getHeader(header);
			if (StringUtils.isNotBlank(ipAddress) && !StringUtils.equalsIgnoreCase("unknown", ipAddress)) {
				return ipAddress.split(",")[0];
			}
		}

		return request.getRemoteAddr();
	}
}
